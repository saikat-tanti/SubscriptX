"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { contractStore } from "@/lib/mock-indexer";
import { toast } from "@/hooks/use-toast";
import { invokeSorobanContract, DEFAULT_CONFIG } from "@/lib/stellar";
import { TransactionStatus, Plan, Subscription } from "@/types";

export function useContract() {
  const { address, isConnected, refreshBalance, setIsModalOpen, signTransaction } =
    useWallet();
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);

  const requireWallet = (): boolean => {
    if (!isConnected || !address) {
      toast.error(
        "Wallet Not Connected",
        "Please connect your Freighter, xBull, or Albedo wallet first."
      );
      setIsModalOpen(true);
      return false;
    }
    return true;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // createPlan
  // ──────────────────────────────────────────────────────────────────────────
  const createPlan = useCallback(
    async (
      title: string,
      description: string,
      priceXlm: number,
      intervalSecs: number,
      maxSubscribers: number
    ): Promise<Plan | null> => {
      if (!requireWallet() || !address) return null;

      setIsTransacting(true);
      setTxStatus("pending");
      const tid = toast.pending(
        "Creating Subscription Plan",
        "Waiting for wallet signature and Testnet gas fee…"
      );

      try {
        // REAL on-chain tx: simulate → wallet popup → sign → submit → confirm
        const { hash } = await invokeSorobanContract(
          DEFAULT_CONFIG.subscriptionContractId,
          "create_plan",
          [address, title, description, Math.round(priceXlm), intervalSecs, maxSubscribers],
          address,
          signTransaction   // ← real wallet-extension sign function
        );

        // Only update local state AFTER the confirmed on-chain tx
        const newPlan = contractStore.addPlan({
          merchant: address,
          title,
          description,
          priceXlm,
          intervalSecs,
          maxSubscribers,
        });

        contractStore.logTransaction({
          hash,
          amount: 0,
          type: "create_plan",
          status: "success",
          sender: address,
          planId: newPlan.id,
        });

        setTxStatus("success");
        toast.dismiss(tid);
        toast.success(
          "Plan Created On-Chain ✓",
          `TX: ${hash.slice(0, 16)}… confirmed on Stellar Testnet`
        );
        await refreshBalance();
        return newPlan;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(tid);
        toast.error("Plan Creation Failed", err?.message ?? "Unknown error");
        return null;
      } finally {
        setIsTransacting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, isConnected, signTransaction, refreshBalance]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // subscribe
  // ──────────────────────────────────────────────────────────────────────────
  const subscribe = useCallback(
    async (plan: Plan): Promise<Subscription | null> => {
      if (!requireWallet() || !address) return null;

      setIsTransacting(true);
      setTxStatus("pending");
      const tid = toast.pending(
        "Processing Subscription",
        `Waiting for wallet signature for ${plan.priceXlm} XLM payment…`
      );

      try {
        const { hash } = await invokeSorobanContract(
          DEFAULT_CONFIG.subscriptionContractId,
          "subscribe",
          [parseInt(plan.id) || 1, address],
          address,
          signTransaction
        );

        const newSub = contractStore.addSubscription(plan.id, address);

        contractStore.logTransaction({
          hash,
          amount: plan.priceXlm,
          type: "subscribe",
          status: "success",
          sender: address,
          recipient: plan.merchant,
          planId: plan.id,
        });

        setTxStatus("success");
        toast.dismiss(tid);
        toast.success(
          "Subscription Active ✓",
          `TX: ${hash.slice(0, 16)}… confirmed — payment routed to Treasury`
        );
        await refreshBalance();
        return newSub;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(tid);
        toast.error("Subscription Failed", err?.message ?? "Unknown error");
        return null;
      } finally {
        setIsTransacting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, isConnected, signTransaction, refreshBalance]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // cancelSubscription
  // ──────────────────────────────────────────────────────────────────────────
  const cancelSubscription = useCallback(
    async (subId: string): Promise<boolean> => {
      if (!requireWallet() || !address) return false;

      setIsTransacting(true);
      setTxStatus("pending");
      const tid = toast.pending(
        "Cancelling Subscription",
        "Waiting for wallet signature…"
      );

      try {
        const { hash } = await invokeSorobanContract(
          DEFAULT_CONFIG.subscriptionContractId,
          "cancel_subscription",
          [parseInt(subId) || 1, address],
          address,
          signTransaction
        );

        contractStore.cancelSubscription(subId, address);

        contractStore.logTransaction({
          hash,
          amount: 0,
          type: "cancel",
          status: "success",
          sender: address,
        });

        setTxStatus("success");
        toast.dismiss(tid);
        toast.info(
          "Subscription Cancelled ✓",
          `TX: ${hash.slice(0, 16)}… confirmed on-chain`
        );
        await refreshBalance();
        return true;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(tid);
        toast.error("Cancellation Failed", err?.message ?? "Unknown error");
        return false;
      } finally {
        setIsTransacting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, isConnected, signTransaction, refreshBalance]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // withdrawRevenue
  // ──────────────────────────────────────────────────────────────────────────
  const withdrawRevenue = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!requireWallet() || !address) return false;

      setIsTransacting(true);
      setTxStatus("pending");
      const tid = toast.pending(
        "Withdrawing Revenue",
        `Waiting for wallet signature for ${amount} XLM withdrawal…`
      );

      try {
        const { hash } = await invokeSorobanContract(
          DEFAULT_CONFIG.treasuryContractId,
          "withdraw",
          [address, Math.round(amount)],
          address,
          signTransaction
        );

        contractStore.logTransaction({
          hash,
          amount,
          type: "withdraw",
          status: "success",
          sender: address,
        });

        setTxStatus("success");
        toast.dismiss(tid);
        toast.success(
          "Withdrawal Complete ✓",
          `TX: ${hash.slice(0, 16)}… — ${amount} XLM sent to wallet`
        );
        await refreshBalance();
        return true;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(tid);
        toast.error("Withdrawal Failed", err?.message ?? "Unknown error");
        return false;
      } finally {
        setIsTransacting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, isConnected, signTransaction, refreshBalance]
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
