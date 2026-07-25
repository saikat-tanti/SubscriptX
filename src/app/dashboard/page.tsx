"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";
import { useContract } from "@/hooks/use-contract";
import { contractStore } from "@/lib/mock-indexer";
import { Plan, Subscription, TransactionRecord } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatXlm, formatDate, truncateAddress, getExplorerTxUrl } from "@/lib/utils";
import {
  Layers,
  CreditCard,
  History,
  Wallet,
  PlusCircle,
  ExternalLink,
  Download,
  Coins,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const { isConnected, address, balanceXlm } = useWallet();
  const { withdrawRevenue, isTransacting } = useContract();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    setPlans(contractStore.getPlans());
    setSubscriptions(contractStore.getSubscriptions(address || undefined));
    setTransactions(contractStore.getTransactions());
  }, [address]);

  // Derived metrics from on-chain store
  const totalPlans = plans.length;
  const activeSubCount = subscriptions.filter((s) => s.isActive).length;
  const totalTxCount = transactions.length;

  // Merchant treasury accumulated revenue calculation
  const merchantRevenue = plans
    .filter((p) => p.merchant.toLowerCase() === (address?.toLowerCase() || ""))
    .reduce((acc, p) => acc + p.priceXlm * p.subscribersCount * 0.985, 0); // net 98.5% after 1.5% fee

  const handleWithdraw = async () => {
    if (merchantRevenue <= 0) return;
    await withdrawRevenue(merchantRevenue);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info">Soroban On-Chain State</Badge>
            {isConnected && (
              <span className="text-xs font-mono text-slate-500">
                Connected: {truncateAddress(address)}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">
            Real-time Soroban contract metrics, active subscription passes, and treasury vault status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/marketplace">
            <Button variant="primary" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Create Subscription Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Plans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Plans
            </CardDescription>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Layers className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{totalPlans}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Published Subscription Contracts</p>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Subscriptions
            </CardDescription>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-purple-600 font-mono">{activeSubCount}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Active Wallet Passes</p>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Transactions
            </CardDescription>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600 font-mono">{totalTxCount}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">On-Chain Interaction History</p>
          </CardContent>
        </Card>

        {/* Wallet Balance (XLM) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Wallet Balance
            </CardDescription>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {formatXlm(balanceXlm)} <span className="text-xs font-semibold text-amber-600">XLM</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Stellar Testnet Account</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Merchant Treasury Widget & Contract Activity Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Merchant Treasury Vault Widget */}
        <Card glow className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Merchant Treasury Vault</CardTitle>
              </div>
              <Badge variant="info">Level 3 Inter-Contract</Badge>
            </div>

            <div className="py-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Accumulated Net Revenue
                </p>
                <p className="text-4xl font-extrabold text-slate-900 font-mono mt-1">
                  {formatXlm(merchantRevenue)} <span className="text-base text-purple-600 font-sans">XLM</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Net after 1.5% protocol fee split via Treasury contract.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Protocol Fee Split:</span>
                  <span className="font-mono text-slate-900 font-semibold">1.5% (150 BPS)</span>
                </div>
                <div className="flex justify-between">
                  <span>Contract Security:</span>
                  <span className="text-emerald-700 font-semibold">Soroban Guarded</span>
                </div>
                <div className="flex justify-between">
                  <span>Withdrawal Mode:</span>
                  <span className="font-mono text-slate-900 font-semibold">Instant Self-Custody</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={merchantRevenue <= 0 || isTransacting}
            variant="primary"
            className="w-full gap-2 bg-purple-600 hover:bg-purple-700 border-purple-600 shadow-purple-500/10"
          >
            <Download className="h-4 w-4" /> Withdraw Revenue to Wallet
          </Button>
        </Card>

        {/* Contract Activity Feed & Log */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-lg">Recent Contract Interactions</CardTitle>
              <CardDescription>Direct Soroban RPC transactions log</CardDescription>
            </div>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-indigo-600">
                View All <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="pt-4">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Activity className="h-8 w-8 mx-auto text-slate-400 animate-pulse" />
                <p className="text-sm font-medium">No recent transactions recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-indigo-600 font-mono text-xs font-bold shadow-sm">
                        {tx.type === "subscribe" && "SUB"}
                        {tx.type === "create_plan" && "PLN"}
                        {tx.type === "cancel" && "CNC"}
                        {tx.type === "withdraw" && "WTH"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 capitalize">
                            {tx.type.replace("_", " ")}
                          </span>
                          <Badge variant={tx.status === "success" ? "success" : "pending"}>
                            {tx.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Hash: {truncateAddress(tx.hash, 6)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {tx.amount > 0 && (
                        <p className="text-sm font-bold text-emerald-600 font-mono">
                          +{tx.amount} XLM
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 font-medium">{formatDate(tx.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
