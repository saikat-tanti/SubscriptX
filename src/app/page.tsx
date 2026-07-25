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
  Lock,
  Star,
} from "lucide-react";
import { formatXlm } from "@/lib/utils";

const FEATURES = [
  {
    icon: Coins,
    title: "Native XLM Billing Pass",
    description:
      "Accept recurring payments in XLM directly on-chain. Zero custodial risk, transparent ledger logs, and sub-second settlement.",
  },
  {
    icon: Wallet,
    title: "Multi-Wallet Standard",
    description:
      "Integrated with Freighter, xBull, and Albedo wallets via official Stellar Wallets Kit.",
  },
  {
    icon: Lock,
    title: "Treasury Vault Custody",
    description:
      "Inter-contract architecture routes payments directly to Treasury vaults with automated 1.5% protocol fee splits.",
  },
  {
    icon: Zap,
    title: "Soroban Rust Performance",
    description:
      "Native Soroban Rust smart contracts designed for low gas usage, high speed, and gas-efficient state storage.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Connect Wallet",
    description: "Link your Freighter, xBull, or Albedo browser extension with one click. Zero setup friction.",
  },
  {
    step: "02",
    title: "Create Subscription Pass",
    description: "Merchants define plan title, price in XLM, billing interval, and max subscriber capacity.",
  },
  {
    step: "03",
    title: "Automated On-Chain Billing",
    description: "Customers subscribe via smart contract calls while merchant revenue accumulates safely in Treasury.",
  },
];

const SAMPLE_PLANS = [
  {
    id: "1",
    title: "Pro Merchant Pass",
    merchant: "GDB5...F0G1",
    priceXlm: 25,
    interval: "Monthly",
    subscribers: 42,
    badge: "Popular",
    description: "Full automated recurring billing engine for modern Web3 dApps.",
  },
  {
    id: "2",
    title: "Enterprise Vault Pass",
    merchant: "GDB5...F0G1",
    priceXlm: 100,
    interval: "Monthly",
    subscribers: 18,
    badge: "High Volume",
    description: "High capacity pass with multi-sig treasury security and instant cashouts.",
  },
  {
    id: "3",
    title: "Developer Starter Pass",
    merchant: "GA7K...L0N2",
    priceXlm: 5,
    interval: "Weekly",
    subscribers: 89,
    badge: "Developer",
    description: "Micro-subscription for decentralized API feeds and testnet nodes.",
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
    <div className="relative overflow-hidden bg-slate-50 text-slate-900">
      {/* Soft Indigo Top Glow Backdrop */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[900px] bg-gradient-to-b from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Stellar Build Challenge • Soroban Level 1-3 Production Architecture
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Decentralized Subscription Billing for{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Stellar Soroban
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Create recurring revenue streams for Web3 applications. Customers subscribe using Stellar assets, settled transparently via on-chain smart contract treasury vaults.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/marketplace">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 py-3.5 shadow-md shadow-indigo-500/10">
                Explore Marketplace <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                Launch Merchant Dashboard
              </Button>
            </Link>
          </div>

          {/* Metric Highlights Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200/80 max-w-3xl mx-auto">
            <div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">100%</p>
              <p className="text-xs text-slate-500 font-medium">On-Chain State</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-indigo-600 font-mono">3+</p>
              <p className="text-xs text-slate-500 font-medium">Supported Wallets</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-purple-600 font-mono">1.5%</p>
              <p className="text-xs text-slate-500 font-medium">Protocol Fee Split</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600 font-mono">&lt; 1s</p>
              <p className="text-xs text-slate-500 font-medium">Soroban Settlement</p>
            </div>
          </div>
        </div>

        {/* Live Interactive Preview Card */}
        <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-mono text-slate-500 font-medium">
                SubscriptX Explorer • Live Testnet Contract State
              </span>
            </div>
            <Badge variant="success">Active Testnet</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs text-slate-500 font-medium">Published Contracts</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">4 Active</p>
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-semibold">
                <CheckCircle className="h-3.5 w-3.5" /> Published on Soroban
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs text-slate-500 font-medium">Active Subscriptions</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1 font-mono">161 Passes</p>
              <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified by Treasury
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs text-slate-500 font-medium">Treasury Vault Volume</p>
              <p className="text-2xl font-bold text-purple-600 mt-1 font-mono">14,850 XLM</p>
              <p className="text-xs text-purple-600 mt-2 flex items-center gap-1 font-semibold">
                <Coins className="h-3.5 w-3.5" /> Instant Cashout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="info">Enterprise SaaS Quality</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Designed for Web3 SaaS Applications
            </h2>
            <p className="text-slate-500 text-sm">
              Combining Stripe-level UI elegance with the trustless transparency of Stellar Soroban smart contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Card key={i} className="hover:border-indigo-300 transition-colors">
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-2">
                      <Icon className="h-5.5 w-5.5" />
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

      {/* Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="neutral">Simple 3-Step Workflow</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900">
            How SubscriptX Operates On-Chain
          </h2>
          <p className="text-slate-500 text-sm">
            Simple, transparent, and direct smart contract execution for merchants and customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-soft hover:shadow-card-hover transition-all"
            >
              <span className="text-4xl font-black text-indigo-200 font-mono">{s.step}</span>
              <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace Preview */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <Badge variant="success">Active Marketplace</Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Featured Subscription Passes</h2>
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
                    <span className="text-xs font-mono text-slate-400">{plan.merchant}</span>
                  </div>
                  <CardTitle className="text-xl">{plan.title}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>

                  <div className="my-6 space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-3xl font-extrabold text-slate-900 font-mono">
                      {formatXlm(plan.priceXlm)} <span className="text-sm text-indigo-600 font-sans">XLM</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Billed {plan.interval}</p>
                  </div>
                </div>

                <Link href="/marketplace">
                  <Button className="w-full gap-2">
                    Subscribe Pass <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl space-y-10">
        <div className="text-center space-y-2">
          <Badge variant="neutral">Frequently Asked Questions</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900">Everything You Need to Know</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-8 sm:p-12 text-center space-y-5 text-white shadow-xl">
          <Badge variant="outline" className="bg-indigo-500/20 text-white border-indigo-400">Get Started Instantly</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white max-w-2xl mx-auto">
            Ready to Launch On-Chain Subscriptions?
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto">
            Connect your wallet to publish subscription plans or join existing Web3 billing passes on Stellar Soroban.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/marketplace">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-slate-100 px-8 py-3.5 text-base gap-2 border-white shadow-lg">
                Launch Application <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
