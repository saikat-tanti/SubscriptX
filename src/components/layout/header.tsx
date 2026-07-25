"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { truncateAddress, formatXlm } from "@/lib/utils";
import {
  Wallet,
  LayoutDashboard,
  Store,
  CreditCard,
  History,
  Settings,
  Menu,
  X,
  Layers,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { label: "History", href: "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const { isConnected, address, balanceXlm, setIsModalOpen } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLandingPage = pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[9px] bg-white">
              <Layers className="h-5 w-5 text-indigo-600 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                SubscriptX
              </span>
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                SOROBAN
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links - Shown ONLY on App Pages (not on Landing page) */}
        {!isLandingPage && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-200",
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action Controls: Network Indicator & Wallet Connect / Launch App */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TESTNET</span>
          </div>

          {isLandingPage ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="gap-2 shadow-indigo-500/20">
                Launch App <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : isConnected && address ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-1 text-emerald-600 font-mono">
                <span className="font-bold">{formatXlm(balanceXlm)}</span>
                <span className="text-[10px] text-slate-400">XLM</span>
              </div>
              <div className="h-3.5 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5 text-slate-700">
                <Wallet className="h-4 w-4 text-indigo-600" />
                <span className="font-mono">{truncateAddress(address)}</span>
              </div>
            </button>
          ) : (
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              size="sm"
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}

          {/* Mobile Menu Toggle (only on app pages) */}
          {!isLandingPage && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg border border-slate-200 p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {!isLandingPage && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-1.5 animate-in slide-in-from-top-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
