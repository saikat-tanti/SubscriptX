"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { contractStore } from "@/lib/mock-indexer";
import { toast } from "@/hooks/use-toast";
import { TransactionStatus, Plan, Subscription } from "@/types";

export function useContract() {
  const { address, isConnected, walletType, refreshBalance, setIsModalOpen } = useWallet();
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);

  /**
   * Helper to ensure wallet connection before performing contract actions
   */
  const checkWalletConnection = (): boolean => {
    if (!isConnected || !address) {
      toast.error("Wallet Not Connected", "Please connect your Freighter, xBull, or Albedo wallet to proceed.");
      setIsModalOpen(true);
      return false;
    }
    return true;
  };

  /**
   * Create a new subscription plan on-chain
   */
  const createPlan = useCallback(
    async (
      title: string,
      description: string,
      priceXlm: number,
      intervalSecs: number,
      maxSubscribers: number
    ): Promise<Plan | null> => {
      if (!checkWalletConnection() || !address) return null;

      setIsTransacting(true);
      setTxStatus("pending");
      const toastId = toast.pending("Creating Subscription Plan", "Signing transaction with connected wallet...");

      try {
        // Simulate network delay for wallet signature & Soroban RPC execution
        await new Promise((res) => setTimeout(res, 1800));

        const newPlan = contractStore.addPlan({
          merchant: address,
          title,
          description,
          priceXlm,
          intervalSecs,
          maxSubscribers,
        });

        const tx = contractStore.logTransaction({
          amount: 0,
          type: "create_plan",
          status: "success",
          sender: address,
          planId: newPlan.id,
        });

        setTxStatus("success");
        toast.dismiss(toastId);
        toast.success("Plan Created On-Chain", `Plan "${title}" is now active on Stellar Testnet!`);
        refreshBalance();
        return newPlan;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(toastId);
        
        let errMsg = err?.message || "Transaction failed";
        if (errMsg.includes("rejected") || errMsg.includes("declined")) {
          errMsg = "Transaction was rejected by your wallet.";
        }
        
        toast.error("Plan Creation Failed", errMsg);
        return null;
      } finally {
        setIsTransacting(false);
      }
    },
    [address, isConnected, refreshBalance]
  );

  /**
   * Subscribe to a subscription plan
   */
  const subscribe = useCallback(
    async (plan: Plan): Promise<Subscription | null> => {
      if (!checkWalletConnection() || !address) return null;

      setIsTransacting(true);
      setTxStatus("pending");
      const toastId = toast.pending(
        "Processing Subscription",
        `Invoking Subscription & Treasury contracts for ${plan.priceXlm} XLM...`
      );

      try {
        await new Promise((res) => setTimeout(res, 2200));

        const newSub = contractStore.addSubscription(plan.id, address);

        contractStore.logTransaction({
          amount: plan.priceXlm,
          type: "subscribe",
          status: "success",
          sender: address,
          recipient: plan.merchant,
          planId: plan.id,
        });

        setTxStatus("success");
        toast.dismiss(toastId);
        toast.success(
          "Subscription Active!",
          `Successfully subscribed to ${plan.title}. Inter-contract payment sent to Treasury.`
        );
        refreshBalance();
        return newSub;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(toastId);
        toast.error("Subscription Error", err?.message || "Contract invocation failed");
        return null;
      } finally {
        setIsTransacting(false);
      }
    },
    [address, isConnected, refreshBalance]
  );

  /**
   * Cancel an existing subscription
   */
  const cancelSubscription = useCallback(
    async (subId: string): Promise<boolean> => {
      if (!checkWalletConnection() || !address) return false;

      setIsTransacting(true);
      setTxStatus("pending");
      const toastId = toast.pending("Cancelling Subscription", "Executing cancel_subscription on Soroban...");

      try {
        await new Promise((res) => setTimeout(res, 1500));

        contractStore.cancelSubscription(subId, address);

        contractStore.logTransaction({
          amount: 0,
          type: "cancel",
          status: "success",
          sender: address,
        });

        setTxStatus("success");
        toast.dismiss(toastId);
        toast.info("Subscription Cancelled", "Subscription status updated to inactive on-chain.");
        refreshBalance();
        return true;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(toastId);
        toast.error("Cancellation Failed", err?.message || "Could not cancel subscription");
        return false;
      } finally {
        setIsTransacting(false);
      }
    },
    [address, isConnected, refreshBalance]
  );

  /**
   * Merchant withdrawal from Treasury contract
   */
  const withdrawRevenue = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!checkWalletConnection() || !address) return false;

      setIsTransacting(true);
      setTxStatus("pending");
      const toastId = toast.pending("Processing Withdrawal", `Withdrawing ${amount} XLM from Treasury Contract...`);

      try {
        await new Promise((res) => setTimeout(res, 2000));

        contractStore.logTransaction({
          amount,
          type: "withdraw",
          status: "success",
          sender: address,
        });

        setTxStatus("success");
        toast.dismiss(toastId);
        toast.success("Withdrawal Complete", `${amount} XLM transferred to your wallet.`);
        refreshBalance();
        return true;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(toastId);
        toast.error("Withdrawal Failed", err?.message || "Treasury withdrawal failed");
        return false;
      } finally {
        setIsTransacting(false);
      }
    },
    [address, isConnected, refreshBalance]
  );

  return {
    createPlan,
    subscribe,
    cancelSubscription,
    withdrawRevenue,
    isTransacting,
    txStatus,
  };
}
