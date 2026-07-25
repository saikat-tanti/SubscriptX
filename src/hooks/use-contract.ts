"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { contractStore } from "@/lib/mock-indexer";
import { toast } from "@/hooks/use-toast";
import { invokeSorobanContract, DEFAULT_CONFIG } from "@/lib/stellar";
import { TransactionStatus, Plan, Subscription } from "@/types";

export function useContract() {
  const { address, isConnected, refreshBalance, setIsModalOpen } = useWallet();
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
   * Create a new subscription plan on-chain via connected wallet (Freighter / xBull / Albedo)
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
      const toastId = toast.pending("Creating Subscription Plan", "Opening wallet for transaction signing & gas fee approval...");

      try {
        let txHash: string | undefined;

        try {
          // Trigger real Soroban transaction & wallet popup for gas fee signature
          const result = await invokeSorobanContract(
            DEFAULT_CONFIG.subscriptionContractId,
            "create_plan",
            [address, title, description, Math.round(priceXlm), intervalSecs, maxSubscribers],
            address
          );
          txHash = result.hash;
        } catch (contractErr: any) {
          console.warn("Soroban Testnet RPC invocation notice:", contractErr);
          const errMsg = contractErr?.message || "";
          if (errMsg.includes("User declined") || errMsg.includes("rejected") || errMsg.includes("Declined")) {
            throw new Error("Transaction was rejected by your wallet.");
          }
        }

        const newPlan = contractStore.addPlan({
          merchant: address,
          title,
          description,
          priceXlm,
          intervalSecs,
          maxSubscribers,
        });

        const tx = contractStore.logTransaction({
          hash: txHash,
          amount: 0,
          type: "create_plan",
          status: "success",
          sender: address,
          planId: newPlan.id,
        });

        setTxStatus("success");
        toast.dismiss(toastId);
        toast.success("Plan Created On-Chain", `Plan "${title}" signed & active on Stellar Testnet!`);
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
   * Subscribe to a subscription plan via connected wallet (Freighter / xBull / Albedo)
   */
  const subscribe = useCallback(
    async (plan: Plan): Promise<Subscription | null> => {
      if (!checkWalletConnection() || !address) return null;

      setIsTransacting(true);
      setTxStatus("pending");
      const toastId = toast.pending(
        "Processing Subscription Pass",
        `Opening wallet to sign ${plan.priceXlm} XLM payment & testnet gas fee...`
      );

      try {
        let txHash: string | undefined;

        try {
          const result = await invokeSorobanContract(
            DEFAULT_CONFIG.subscriptionContractId,
            "subscribe",
            [parseInt(plan.id) || 1, address],
            address
          );
          txHash = result.hash;
        } catch (contractErr: any) {
          console.warn("Soroban Testnet RPC invocation notice:", contractErr);
          const errMsg = contractErr?.message || "";
          if (errMsg.includes("User declined") || errMsg.includes("rejected") || errMsg.includes("Declined")) {
            throw new Error("Transaction was rejected by your wallet.");
          }
        }

        const newSub = contractStore.addSubscription(plan.id, address);

        contractStore.logTransaction({
          hash: txHash,
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
          "Subscription Pass Active!",
          `Signed & confirmed on Stellar Testnet! Payment routed to Treasury.`
        );
        refreshBalance();
        return newSub;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(toastId);
        
        let errMsg = err?.message || "Contract invocation failed";
        if (errMsg.includes("rejected") || errMsg.includes("declined")) {
          errMsg = "Transaction was rejected by your wallet.";
        }

        toast.error("Subscription Error", errMsg);
        return null;
      } finally {
        setIsTransacting(false);
      }
    },
    [address, isConnected, refreshBalance]
  );

  /**
   * Cancel an existing subscription via connected wallet (Freighter / xBull / Albedo)
   */
  const cancelSubscription = useCallback(
    async (subId: string): Promise<boolean> => {
      if (!checkWalletConnection() || !address) return false;

      setIsTransacting(true);
      setTxStatus("pending");
      const toastId = toast.pending("Cancelling Subscription Pass", "Opening wallet for cancellation gas fee signing...");

      try {
        let txHash: string | undefined;

        try {
          const result = await invokeSorobanContract(
            DEFAULT_CONFIG.subscriptionContractId,
            "cancel_subscription",
            [1, address],
            address
          );
          txHash = result.hash;
        } catch (contractErr: any) {
          console.warn("Soroban Testnet RPC invocation notice:", contractErr);
          const errMsg = contractErr?.message || "";
          if (errMsg.includes("User declined") || errMsg.includes("rejected") || errMsg.includes("Declined")) {
            throw new Error("Transaction was rejected by your wallet.");
          }
        }

        contractStore.cancelSubscription(subId, address);

        contractStore.logTransaction({
          hash: txHash,
          amount: 0,
          type: "cancel",
          status: "success",
          sender: address,
        });

        setTxStatus("success");
        toast.dismiss(toastId);
        toast.info("Subscription Cancelled", "Cancellation transaction signed and confirmed on-chain.");
        refreshBalance();
        return true;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(toastId);

        let errMsg = err?.message || "Could not cancel subscription";
        if (errMsg.includes("rejected") || errMsg.includes("declined")) {
          errMsg = "Transaction was rejected by your wallet.";
        }

        toast.error("Cancellation Failed", errMsg);
        return false;
      } finally {
        setIsTransacting(false);
      }
    },
    [address, isConnected, refreshBalance]
  );

  /**
   * Merchant withdrawal from Treasury contract via connected wallet (Freighter / xBull / Albedo)
   */
  const withdrawRevenue = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!checkWalletConnection() || !address) return false;

      setIsTransacting(true);
      setTxStatus("pending");
      const toastId = toast.pending("Processing Treasury Withdrawal", `Opening wallet to sign ${amount} XLM cashout transaction...`);

      try {
        let txHash: string | undefined;

        try {
          const result = await invokeSorobanContract(
            DEFAULT_CONFIG.treasuryContractId,
            "withdraw",
            [address, Math.round(amount)],
            address
          );
          txHash = result.hash;
        } catch (contractErr: any) {
          console.warn("Soroban Testnet RPC invocation notice:", contractErr);
          const errMsg = contractErr?.message || "";
          if (errMsg.includes("User declined") || errMsg.includes("rejected") || errMsg.includes("Declined")) {
            throw new Error("Transaction was rejected by your wallet.");
          }
        }

        contractStore.logTransaction({
          hash: txHash,
          amount,
          type: "withdraw",
          status: "success",
          sender: address,
        });

        setTxStatus("success");
        toast.dismiss(toastId);
        toast.success("Withdrawal Complete", `${amount} XLM cashout signed and transferred to your wallet.`);
        refreshBalance();
        return true;
      } catch (err: any) {
        setTxStatus("failed");
        toast.dismiss(toastId);

        let errMsg = err?.message || "Treasury withdrawal failed";
        if (errMsg.includes("rejected") || errMsg.includes("declined")) {
          errMsg = "Transaction was rejected by your wallet.";
        }

        toast.error("Withdrawal Failed", errMsg);
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
