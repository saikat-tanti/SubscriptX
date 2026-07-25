import React from "react";
import Link from "next/link";
import { Layers, Github, Twitter, ExternalLink, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-white">
                  <Layers className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">SubscriptX</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Decentralized subscription billing platform built on Stellar Soroban smart contracts.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Stellar Build Challenge Verified
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-indigo-600 transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/subscriptions" className="hover:text-indigo-600 transition-colors">
                  My Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-indigo-600 transition-colors">
                  Transaction History
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://soroban.stellar.org/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  Soroban Docs <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://stellar.expert/explorer/testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  Stellar Expert Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  Freighter Wallet <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Network Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Stellar Testnet</h4>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5 font-mono text-slate-600">
              <p><span className="text-slate-400">RPC:</span> soroban-testnet</p>
              <p><span className="text-slate-400">Asset:</span> Native XLM</p>
              <p><span className="text-slate-400">Inter-Contract:</span> Enabled</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SubscriptX. Built for Stellar Build Challenge.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
