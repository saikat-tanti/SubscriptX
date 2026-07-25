"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";
import { useContract } from "@/hooks/use-contract";
import { contractStore } from "@/lib/mock-indexer";
import { Subscription } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate, formatXlm, truncateAddress, getExplorerTxUrl } from "@/lib/utils";
import {
  CreditCard,
  Calendar,
  Clock,
  ShieldCheck,
  ExternalLink,
  Ban,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function MySubscriptionsPage() {
  const { isConnected, address, setIsModalOpen } = useWallet();
  const { cancelSubscription, isTransacting } = useContract();

  const [userSubs, setUserSubs] = useState<Subscription[]>([]);
  const [selectedCancelSub, setSelectedCancelSub] = useState<Subscription | null>(null);

  useEffect(() => {
    if (address) {
      setUserSubs(contractStore.getSubscriptions(address));
    } else {
      setUserSubs([]);
    }
  }, [address]);

  const refreshSubs = () => {
    if (address) {
      setUserSubs(contractStore.getSubscriptions(address));
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedCancelSub) return;
    const ok = await cancelSubscription(selectedCancelSub.id);
    if (ok) {
      setSelectedCancelSub(null);
      refreshSubs();
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info">Soroban Active Passes</Badge>
            {isConnected && (
              <span className="text-xs font-mono text-slate-400">
                Wallet: {truncateAddress(address)}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">My Subscriptions</h1>
          <p className="text-sm text-slate-400">
            Manage your active subscription passes and monitor on-chain renewal dates.
          </p>
        </div>

        <Link href="/marketplace">
          <Button variant="outline" className="gap-2">
            Explore Marketplace <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {!isConnected ? (
        <Card className="text-center py-16 space-y-4">
          <CreditCard className="h-12 w-12 mx-auto text-blue-400 animate-pulse" />
          <h3 className="text-xl font-bold text-white">Wallet Not Connected</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Connect your Freighter, xBull, or Albedo wallet to view active subscription passes.
          </p>
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Connect Wallet
          </Button>
        </Card>
      ) : userSubs.length === 0 ? (
        <Card className="text-center py-16 space-y-4 text-slate-400">
          <CreditCard className="h-12 w-12 mx-auto text-slate-600" />
          <h3 className="text-xl font-bold text-white">No Active Subscriptions</h3>
          <p className="text-sm max-w-md mx-auto">
            You currently have no active subscription passes recorded on Stellar Soroban.
          </p>
          <Link href="/marketplace">
            <Button variant="primary">Browse Marketplace</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSubs.map((sub) => (
            <Card key={sub.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <Badge variant={sub.isActive ? "success" : "neutral"}>
                    {sub.isActive ? "Active Pass" : "Cancelled"}
                  </Badge>
                  <span className="text-xs font-mono text-slate-500">ID: {sub.id}</span>
                </div>

                <CardTitle className="text-xl">{sub.planTitle || "Soroban Plan Pass"}</CardTitle>
                <CardDescription className="mt-1 font-mono text-emerald-400 font-bold">
                  {formatXlm(sub.planPriceXlm || 0)} XLM
                </CardDescription>

                <div className="my-6 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-blue-400" /> Start Date:
                    </span>
                    <span className="font-mono">{formatDate(sub.startTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-purple-400" /> Renewal Date:
                    </span>
                    <span className="font-mono">{formatDate(sub.endTime)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Merchant:</span>
                    <span className="font-mono text-slate-300">
                      {truncateAddress(sub.merchant || null)}
                    </span>
                  </div>
                </div>
              </div>

              {sub.isActive ? (
                <Button
                  onClick={() => setSelectedCancelSub(sub)}
                  variant="danger"
                  className="w-full gap-2"
                >
                  <Ban className="h-4 w-4" /> Cancel Subscription
                </Button>
              ) : (
                <div className="text-center text-xs text-slate-500 py-2 font-mono">
                  Subscription inactive on-chain
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!selectedCancelSub}
        onClose={() => setSelectedCancelSub(null)}
        title="Cancel Subscription"
        description="Are you sure you want to cancel this active subscription pass?"
        maxWidth="md"
      >
        {selectedCancelSub && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2 text-rose-300 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="h-5 w-5" /> Warning
              </div>
              <p>
                Cancelling will set your subscription status to inactive on-chain via the Soroban contract. You can re-subscribe anytime in the Marketplace.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-bold text-white">{selectedCancelSub.planTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Subscription ID:</span>
                <span className="font-mono text-slate-400">{selectedCancelSub.id}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedCancelSub(null)}>
                Keep Active
              </Button>
              <Button
                onClick={handleConfirmCancel}
                variant="danger"
                isLoading={isTransacting}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
