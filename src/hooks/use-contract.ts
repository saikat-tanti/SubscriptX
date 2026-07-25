"use client";

import { useState, useCallback, useEffect } from "react";
import { Address, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { useWallet } from "@/hooks/use-wallet";
import { contractStore } from "@/lib/mock-indexer";
import { toast } from "@/hooks/use-toast";
import {
  invokeSorobanContract,
  fetchOnChainPlans,
  DEFAULT_CONFIG,
} from "@/lib/stellar";
import { TransactionStatus, Plan, Subscription } from "@/types";

// ── Typed ScVal builders matching Rust function signatures ──────────────────

/** Soroban Address (G... or C... 56-char key) */
const scAddress = (addr: string) => new Address(addr).toScVal();

/** Soroban String (soroban_sdk::String) */
const scString = (s: string) => nativeToScVal(s, { type: "string" });

/** Rust i128 */
const scI128 = (n: number) =>
  nativeToScVal(BigInt(Math.round(n)), { type: "i128" });

/** Rust u64 */
const scU64 = (n: number) => nativeToScVal(BigInt(n), { type: "u64" });

/** Rust u32 */
const scU32 = (n: number) => nativeToScVal(n, { type: "u32" });

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useContract() {
  const { address, isConnected, refreshBalance, setIsModalOpen, signTx } =
    useWallet();
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);

  // Sync real on-chain plans from Soroban smart contract on mount
  useEffect(() => {
    fetchOnChainPlans().then((onChainPlans) => {
      if (onChainPlans.length > 0) {
        contractStore.syncOnChainPlans(onChainPlans);
      }
    });
  }, []);

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
        const args: xdr.ScVal[] = [
          scAddress(address), // merchant: Address
          scString(title), // title: soroban_sdk::String
          scString(description), // description: soroban_sdk::String
          scI128(priceXlm), // price_xlm: i128
          scU64(intervalSecs), // interval_secs: u64
          scU32(maxSubscribers), // max_subscribers: u32
        ];

        const { hash } = await invokeSorobanContract(
          DEFAULT_CONFIG.subscriptionContractId,
          "create_plan",
          args,
          address,
          signTx
        );

        // Fetch fresh on-chain plans to get the exact on-chain ID
        const onChainPlans = await fetchOnChainPlans();
        let newPlan: Plan;

        if (onChainPlans.length > 0) {
          contractStore.syncOnChainPlans(onChainPlans);
          newPlan =
            onChainPlans.find((p) => p.title === title) || onChainPlans[0];
        } else {
          newPlan = contractStore.addPlan({
            merchant: address,
            title,
            description,
            priceXlm,
            intervalSecs,
            maxSubscribers,
          });
        }

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
    [address, isConnected, signTx, refreshBalance]
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
        const planIdNum = parseInt(plan.id, 10) || 1;

        const args: xdr.ScVal[] = [
          scU64(planIdNum), // plan_id: u64
          scAddress(address), // subscriber: Address
        ];

        const { hash } = await invokeSorobanContract(
          DEFAULT_CONFIG.subscriptionContractId,
          "subscribe",
          args,
          address,
          signTx
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
    [address, isConnected, signTx, refreshBalance]
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
        const subIdNum = parseInt(subId, 10) || 1;

        const args: xdr.ScVal[] = [
          scU64(subIdNum), // subscription_id: u64
          scAddress(address), // subscriber: Address
        ];

        const { hash } = await invokeSorobanContract(
          DEFAULT_CONFIG.subscriptionContractId,
          "cancel_subscription",
          args,
          address,
          signTx
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
    [address, isConnected, signTx, refreshBalance]
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
        const args: xdr.ScVal[] = [
          scAddress(address), // merchant: Address
          scI128(amount), // amount: i128
        ];

        const { hash } = await invokeSorobanContract(
          DEFAULT_CONFIG.treasuryContractId,
          "withdraw",
          args,
          address,
          signTx
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
    [address, isConnected, signTx, refreshBalance]
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
