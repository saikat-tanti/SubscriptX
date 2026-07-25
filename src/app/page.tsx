"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Wallet,
  Coins,
  ChevronDown,
  Sparkles,
  CheckCircle,
  Globe,
  Clock,
  Lock,
} from "lucide-react";
import { formatXlm } from "@/lib/utils";

const FEATURES = [
  {
    icon: Coins,
    title: "Native Stellar XLM Billing",
    description:
      "Accept recurring payments in XLM directly on-chain. Zero intermediaries, zero custodial risk, and instant settlement.",
  },
  {
    icon: Wallet,
    title: "Multi-Wallet Standard",
    description:
      "Seamless integration with Freighter, xBull, and Albedo wallets using the official Stellar Wallets Kit.",
  },
  {
    icon: Lock,
    title: "Treasury Contract Vaults",
    description:
      "Inter-contract communication routes subscription payments straight to Treasury vaults with automated protocol fee splits.",
  },
  {
    icon: Zap,
    title: "Sub-Second Soroban Speed",
    description:
      "Built natively on Stellar Soroban Rust contracts for gas-efficient, fast, and transparent subscription management.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect Your Wallet",
    description: "Link your Freighter, xBull, or Albedo wallet with one click. No registration or seed phrase disclosures.",
  },
  {
    step: "02",
    title: "Publish Subscription Plan",
    description: "Merchants create plans with customizable XLM price, interval, and max subscriber limits directly on Soroban.",
  },
  {
    step: "03",
    title: "Subscribe & Settle",
    description: "Customers subscribe with automated smart contract logic. Revenue accumulates transparently in merchant treasury.",
  },
];

const SAMPLE_PLANS = [
  {
    id: "1",
    title: "Pro Merchant Suite",
    merchant: "GDB5...F0G1",
    priceXlm: 25,
    interval: "Monthly",
    subscribers: 42,
    badge: "Popular",
    description: "Full automated recurring billing engine for modern dApps.",
  },
  {
    id: "2",
    title: "Enterprise Treasury Vault",
    merchant: "GDB5...F0G1",
    priceXlm: 100,
    interval: "Monthly",
    subscribers: 18,
    badge: "High Volume",
    description: "High capacity plan with multi-sig treasury security and instant withdrawals.",
  },
  {
    id: "3",
    title: "Developer Starter Pass",
    merchant: "GA7K...L0N2",
    priceXlm: 5,
    interval: "Weekly",
    subscribers: 89,
    badge: "Developer",
    description: "Micro-subscription for decentralized API feeds and testnet tooling.",
  },
];

const FAQS = [
  {
    q: "How does SubscriptX store subscription data?",
    a: "SubscriptX operates on a 100% blockchain-first architecture. Subscription plans, active customer passes, merchant treasury balances, and transaction logs are stored directly on Stellar Soroban smart contracts. No database or traditional web server is required.",
  },
  {
    q: "Which Stellar wallets are supported?",
    a: "SubscriptX supports Freighter, xBull Wallet, and Albedo via @creit.tech/stellar-wallets-kit. Users can easily connect, sign Soroban transactions, and manage subscriptions with their preferred provider.",
  },
  {
    q: "What is the inter-contract Treasury system?",
    a: "When a subscriber signs a plan transaction, the Subscription contract invokes the Treasury contract. The Treasury calculates a low protocol fee (1.5%) and deposits the net revenue directly into the merchant's on-chain treasury balance for withdrawal.",
  },
  {
    q: "Can I test SubscriptX on Stellar Testnet?",
    a: "Yes! SubscriptX is pre-configured to run on Stellar Testnet (https://soroban-testnet.stellar.org). You can request testnet XLM from the official Stellar Friendbot and test creating and subscribing to plans immediately.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative overflow-hidden bg-[#030712] text-slate-100">
      {/* Glow Backdrops */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] bg-gradient-to-tr from-blue-600/15 via-purple-600/15 to-transparent blur-[120px] rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-xl animate-pulse">
            <Sparkles className="h-4 w-4 text-blue-400" />
            Stellar Build Challenge • Soroban Level 1-3 Production Architecture
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Decentralized Subscription Billing on{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Stellar Soroban
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Create recurring revenue streams for Web3 dApps. Customers subscribe using Stellar assets, while payments are settled transparently via smart contract treasury vaults.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/marketplace">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 py-4 shadow-xl shadow-blue-600/30">
                Explore Marketplace <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-4">
                Launch Merchant Dashboard
              </Button>
            </Link>
          </div>

          {/* Key Metric Highlights */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80 max-w-3xl mx-auto">
            <div>
              <p className="text-2xl font-bold text-white font-mono">100%</p>
              <p className="text-xs text-slate-400">On-Chain Backend</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400 font-mono">3+</p>
              <p className="text-xs text-slate-400">Supported Wallets</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400 font-mono">1.5%</p>
              <p className="text-xs text-slate-400">Low Protocol Fee</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400 font-mono">&lt; 1s</p>
              <p className="text-xs text-slate-400">Soroban Settlement</p>
            </div>
          </div>
        </div>

        {/* Live Interactive Dashboard Preview Card */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">SubscriptX Soroban Explorer • Live On-Chain Preview</span>
            </div>
            <Badge variant="success">Active Testnet</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
              <p className="text-xs text-slate-400">Total Contract Plans</p>
              <p className="text-2xl font-bold text-white mt-1 font-mono">4 Active</p>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Published on Soroban
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
              <p className="text-xs text-slate-400">Active Subscriptions</p>
              <p className="text-2xl font-bold text-blue-400 mt-1 font-mono">161 Passes</p>
              <p className="text-xs text-blue-300 mt-2 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified by Treasury
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
              <p className="text-xs text-slate-400">Treasury Vault Volume</p>
              <p className="text-2xl font-bold text-purple-400 mt-1 font-mono">14,850 XLM</p>
              <p className="text-xs text-purple-300 mt-2 flex items-center gap-1">
                <Coins className="h-3 w-3" /> Instant Merchant Cashout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-950/60 border-y border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="info">Enterprise SaaS Aesthetics</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Built for Modern Web3 SaaS Architecture
            </h2>
            <p className="text-slate-400 text-sm">
              Combining Stripe-level UI elegance with the trustless security of Stellar Soroban smart contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Card key={i} className="hover:border-blue-500/40 transition-colors">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-2">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{f.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="neutral">3-Step Workflow</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How SubscriptX Operates On-Chain
          </h2>
          <p className="text-slate-400 text-sm">
            Simple, transparent, and direct smart contract execution for merchants and customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="relative rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 space-y-4 hover:border-slate-700 transition-colors"
            >
              <span className="text-4xl font-black text-blue-500/30 font-mono">{s.step}</span>
              <h3 className="text-xl font-bold text-white">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace Preview Section */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <Badge variant="success">Active Marketplace</Badge>
              <h2 className="text-3xl font-extrabold text-white mt-2">Popular Subscription Plans</h2>
            </div>
            <Link href="/marketplace">
              <Button variant="outline" className="gap-2">
                View Full Marketplace <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_PLANS.map((plan) => (
              <Card key={plan.id} glow className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <Badge variant="info">{plan.badge}</Badge>
                    <span className="text-xs font-mono text-slate-500">{plan.merchant}</span>
                  </div>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>

                  <div className="my-6 space-y-1">
                    <p className="text-3xl font-extrabold text-white font-mono">
                      {formatXlm(plan.priceXlm)} <span className="text-sm text-blue-400 font-sans">XLM</span>
                    </p>
                    <p className="text-xs text-slate-400">Billed {plan.interval}</p>
                  </div>
                </div>

                <Link href="/marketplace">
                  <Button className="w-full gap-2">
                    Subscribe Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="neutral">Frequently Asked Questions</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Everything You Need to Know</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-white text-lg hover:text-blue-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-purple-950/60 p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-2xl">
          <Badge variant="info">Get Started Instantly</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white max-w-2xl mx-auto">
            Ready to Launch Decentralized Subscriptions?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Connect your wallet to publish subscription plans or join existing dApp billing passes on Stellar Soroban.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/marketplace">
              <Button size="lg" className="px-8 py-4 text-base gap-2">
                Launch App <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
