"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useContract } from "@/hooks/use-contract";
import { contractStore } from "@/lib/mock-indexer";
import { Plan } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { formatXlm, formatInterval, truncateAddress } from "@/lib/utils";
import {
  Store,
  PlusCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  Users,
  Clock,
} from "lucide-react";

export default function MarketplacePage() {
  const { isConnected, address, setIsModalOpen } = useWallet();
  const { createPlan, subscribe, isTransacting } = useContract();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("all");

  // Create Plan Form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("25");
  const [newIntervalDays, setNewIntervalDays] = useState("30");
  const [newMaxSubs, setNewMaxSubs] = useState("100");

  // Subscribe Confirmation Modal state
  const [selectedSubscribePlan, setSelectedSubscribePlan] = useState<Plan | null>(null);

  useEffect(() => {
    import("@/lib/stellar").then(({ fetchOnChainPlans }) => {
      fetchOnChainPlans().then((onChainPlans) => {
        if (onChainPlans.length > 0) {
          contractStore.syncOnChainPlans(onChainPlans);
        }
        setPlans(contractStore.getPlans());
      });
    });
  }, []);

  const refreshPlans = () => {
    setPlans(contractStore.getPlans());
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newPrice) return;

    const priceNum = parseFloat(newPrice);
    const intervalSecs = parseInt(newIntervalDays) * 86400;
    const maxSubs = parseInt(newMaxSubs) || 0;

    const result = await createPlan(newTitle, newDesc, priceNum, intervalSecs, maxSubs);
    if (result) {
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      refreshPlans();
    }
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedSubscribePlan) return;
    const res = await subscribe(selectedSubscribePlan);
    if (res) {
      setSelectedSubscribePlan(null);
      refreshPlans();
    }
  };

  // Filter plans based on search & interval selection
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedInterval === "all") return matchesSearch;
    if (selectedInterval === "monthly") return matchesSearch && plan.intervalSecs === 2592000;
    if (selectedInterval === "weekly") return matchesSearch && plan.intervalSecs === 604800;
    if (selectedInterval === "annual") return matchesSearch && plan.intervalSecs === 31536000;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info">Plan Marketplace</Badge>
            <span className="text-xs font-mono text-slate-500">Direct Soroban Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Browse Subscription Passes</h1>
          <p className="text-sm text-slate-500">
            Subscribe to decentralized billing passes or publish a new subscription plan for your dApp.
          </p>
        </div>

        <Button
          onClick={() => {
            if (!isConnected) setIsModalOpen(true);
            else setIsCreateModalOpen(true);
          }}
          variant="primary"
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" /> Create Subscription Plan
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search plans by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs
          tabs={[
            { id: "all", label: "All Intervals" },
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "annual", label: "Annual" },
          ]}
          activeTab={selectedInterval}
          onChange={setSelectedInterval}
        />
      </div>

      {/* Plans Directory Grid */}
      {filteredPlans.length === 0 ? (
        <Card className="text-center py-16 text-slate-500 space-y-3">
          <Store className="h-12 w-12 mx-auto text-slate-400 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-900">No plans match your criteria</h3>
          <p className="text-sm">Try clearing your search terms or create a new plan.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} glow className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <Badge variant="info">{formatInterval(plan.intervalSecs)}</Badge>
                  <span className="text-xs font-mono text-slate-400" title={plan.merchant}>
                    {truncateAddress(plan.merchant)}
                  </span>
                </div>

                <CardTitle className="text-xl text-slate-900">{plan.title}</CardTitle>
                <CardDescription className="mt-2 min-h-[48px] text-slate-500">
                  {plan.description}
                </CardDescription>

                <div className="my-6 space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-3xl font-extrabold text-slate-900 font-mono">
                    {formatXlm(plan.priceXlm)} <span className="text-sm text-indigo-600 font-sans">XLM</span>
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-indigo-600" />
                      {plan.subscribersCount} / {plan.maxSubscribers || "∞"} Subscribers
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-purple-600" />
                      {formatInterval(plan.intervalSecs)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!isConnected) setIsModalOpen(true);
                  else setSelectedSubscribePlan(plan);
                }}
                variant="primary"
                className="w-full gap-2 mt-2"
              >
                Subscribe Pass <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Subscription Plan"
        description="Publish a new subscription contract on Stellar Soroban testnet."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Plan Title"
            placeholder="e.g. Pro SaaS Pass"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <Input
            label="Description"
            placeholder="e.g. Unlimited dApp feature access and API calls"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (XLM)"
              type="number"
              min="1"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
            />
            <Input
              label="Billing Interval (Days)"
              type="number"
              min="1"
              value={newIntervalDays}
              onChange={(e) => setNewIntervalDays(e.target.value)}
              required
            />
            <Input
              label="Max Subscribers (0 = ∞)"
              type="number"
              min="0"
              value={newMaxSubs}
              onChange={(e) => setNewMaxSubs(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1 font-medium">
            <div className="flex justify-between">
              <span>Merchant Address:</span>
              <span className="font-mono text-slate-900 font-semibold">{truncateAddress(address)}</span>
            </div>
            <div className="flex justify-between">
              <span>Network:</span>
              <span className="text-emerald-600 font-bold">Stellar Testnet</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isTransacting}>
              Publish On-Chain Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subscribe Action Confirmation Modal */}
      <Modal
        isOpen={!!selectedSubscribePlan}
        onClose={() => setSelectedSubscribePlan(null)}
        title="Confirm Subscription Pass"
        description="Verify smart contract parameters before signing transaction."
        maxWidth="md"
      >
        {selectedSubscribePlan && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedSubscribePlan.title}</h4>
                <p className="text-xs text-slate-500">{selectedSubscribePlan.description}</p>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    {selectedSubscribePlan.priceXlm} XLM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Billing Interval:</span>
                  <span className="font-mono font-semibold">{formatInterval(selectedSubscribePlan.intervalSecs)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Merchant:</span>
                  <span className="font-mono font-semibold">{truncateAddress(selectedSubscribePlan.merchant)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-xs text-indigo-800 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
              <span>
                Level 3 Inter-Contract Call: Payment will be processed via Subscription contract and deposited into the Treasury vault.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedSubscribePlan(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSubscribe}
                variant="primary"
                isLoading={isTransacting}
              >
                Confirm & Sign Transaction
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
