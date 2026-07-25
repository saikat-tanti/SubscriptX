import { Plan, Subscription, TransactionRecord } from "@/types";

const INITIAL_PLANS: Plan[] = [
  {
    id: "1",
    merchant: "GDB5M6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3",
    title: "Pro Merchant Billing",
    description: "Full automated subscription payments for SaaS platforms on Stellar Soroban.",
    priceXlm: 25,
    intervalSecs: 2592000, // Monthly
    maxSubscribers: 500,
    subscribersCount: 42,
    isActive: true,
    createdAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "2",
    merchant: "GDB5M6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3",
    title: "Enterprise Suite & Treasury",
    description: "High-volume recurring payment processing with 1.5% low protocol fees & multi-sig treasury custody.",
    priceXlm: 100,
    intervalSecs: 2592000,
    maxSubscribers: 1000,
    subscribersCount: 18,
    isActive: true,
    createdAt: "2026-07-05T14:30:00Z",
  },
  {
    id: "3",
    merchant: "GA7K9L2M4N6P8R0T2V4X6Z8B0D2F4H6J8L0N2P4",
    title: "Developer Starter Tier",
    description: "Micro-subscriptions for decentralized API access, testnet nodes, and developer tooling.",
    priceXlm: 5,
    intervalSecs: 604800, // Weekly
    maxSubscribers: 100,
    subscribersCount: 89,
    isActive: true,
    createdAt: "2026-07-10T09:15:00Z",
  },
  {
    id: "4",
    merchant: "GB2C4D6F8H0J2L4N6P8R0T2V4X6Z8B0D2F4H6J8",
    title: "Annual Pro Pass",
    description: "Discounted annual billing plan with zero downtime and instant on-chain settlement.",
    priceXlm: 250,
    intervalSecs: 31536000, // Annual
    maxSubscribers: 250,
    subscribersCount: 12,
    isActive: true,
    createdAt: "2026-07-15T16:20:00Z",
  },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-101",
    planId: "1",
    subscriber: "GC3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0P1",
    startTime: Math.floor(Date.now() / 1000) - 86400 * 10,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 20,
    isActive: true,
    planTitle: "Pro Merchant Billing",
    planPriceXlm: 25,
    merchant: "GDB5M6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3",
  },
  {
    id: "sub-102",
    planId: "3",
    subscriber: "GC3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0P1",
    startTime: Math.floor(Date.now() / 1000) - 86400 * 3,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 4,
    isActive: true,
    planTitle: "Developer Starter Tier",
    planPriceXlm: 5,
    merchant: "GA7K9L2M4N6P8R0T2V4X6Z8B0D2F4H6J8L0N2P4",
  },
];

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    hash: "6f9a2b8c4d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a",
    amount: 25,
    type: "subscribe",
    status: "success",
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 4,
    sender: "GC3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0P1",
    recipient: "GDB5M6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3",
    planId: "1",
  },
  {
    hash: "8a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a2b",
    amount: 5,
    type: "subscribe",
    status: "success",
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 24,
    sender: "GC3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0P1",
    recipient: "GA7K9L2M4N6P8R0T2V4X6Z8B0D2F4H6J8L0N2P4",
    planId: "3",
  },
  {
    hash: "3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e",
    amount: 100,
    type: "create_plan",
    status: "success",
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 72,
    sender: "GDB5M6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3",
    planId: "2",
  },
];

class ContractStore {
  private plans: Plan[] = [];
  private subscriptions: Subscription[] = [];
  private transactions: TransactionRecord[] = [];

  constructor() {
    this.loadStorage();
  }

  private loadStorage() {
    if (typeof window === "undefined") {
      this.plans = INITIAL_PLANS;
      this.subscriptions = INITIAL_SUBSCRIPTIONS;
      this.transactions = INITIAL_TRANSACTIONS;
      return;
    }

    try {
      const storedPlans = localStorage.getItem("subscriptx_plans");
      const storedSubs = localStorage.getItem("subscriptx_subscriptions");
      const storedTxs = localStorage.getItem("subscriptx_transactions");

      this.plans = storedPlans ? JSON.parse(storedPlans) : INITIAL_PLANS;
      this.subscriptions = storedSubs ? JSON.parse(storedSubs) : INITIAL_SUBSCRIPTIONS;
      this.transactions = storedTxs ? JSON.parse(storedTxs) : INITIAL_TRANSACTIONS;
    } catch (e) {
      this.plans = INITIAL_PLANS;
      this.subscriptions = INITIAL_SUBSCRIPTIONS;
      this.transactions = INITIAL_TRANSACTIONS;
    }
  }

  private saveStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("subscriptx_plans", JSON.stringify(this.plans));
      localStorage.setItem("subscriptx_subscriptions", JSON.stringify(this.subscriptions));
      localStorage.setItem("subscriptx_transactions", JSON.stringify(this.transactions));
    } catch (e) {
      console.error("Failed to save subscriptx local state", e);
    }
  }

  public getPlans(): Plan[] {
    return this.plans;
  }

  public getSubscriptions(subscriberAddress?: string): Subscription[] {
    if (!subscriberAddress) return this.subscriptions;
    return this.subscriptions.filter(s => s.subscriber.toLowerCase() === subscriberAddress.toLowerCase());
  }

  public getTransactions(): TransactionRecord[] {
    return this.transactions;
  }

  public syncOnChainPlans(onChainPlans: Plan[]) {
    if (!onChainPlans || onChainPlans.length === 0) return;
    onChainPlans.forEach(onChainPlan => {
      const idx = this.plans.findIndex(p => p.id === onChainPlan.id);
      if (idx >= 0) {
        this.plans[idx] = { ...this.plans[idx], ...onChainPlan };
      } else {
        this.plans.unshift(onChainPlan);
      }
    });
    this.saveStorage();
  }

  public addPlan(plan: Omit<Plan, "id" | "subscribersCount" | "isActive">, explicitId?: string): Plan {
    const newId = explicitId || (this.plans.length + 1).toString();
    const newPlan: Plan = {
      ...plan,
      id: newId,
      subscribersCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.plans.unshift(newPlan);
    this.saveStorage();
    return newPlan;
  }

  public addSubscription(planId: string, subscriber: string): Subscription {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) throw new Error("Plan not found");

    plan.subscribersCount += 1;
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      planId,
      subscriber,
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + plan.intervalSecs,
      isActive: true,
      planTitle: plan.title,
      planPriceXlm: plan.priceXlm,
      merchant: plan.merchant,
    };

    this.subscriptions.unshift(newSub);
    this.saveStorage();
    return newSub;
  }

  public cancelSubscription(subId: string, subscriber: string): void {
    const sub = this.subscriptions.find(s => s.id === subId && s.subscriber.toLowerCase() === subscriber.toLowerCase());
    if (!sub) throw new Error("Subscription not found or unauthorized");

    sub.isActive = false;

    const plan = this.plans.find(p => p.id === sub.planId);
    if (plan && plan.subscribersCount > 0) {
      plan.subscribersCount -= 1;
    }

    this.saveStorage();
  }

  public logTransaction(tx: Omit<TransactionRecord, "hash" | "timestamp"> & { hash?: string }): TransactionRecord {
    const hash = tx.hash || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const record: TransactionRecord = {
      ...tx,
      hash,
      timestamp: Math.floor(Date.now() / 1000),
    };
    this.transactions.unshift(record);
    this.saveStorage();
    return record;
  }
}

export const contractStore = new ContractStore();
