"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { useWallet } from "@/hooks/use-wallet";
import { WalletType } from "@/types";
import { Wallet, ShieldCheck, ArrowRight, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const WALLETS = [
  {
    id: "freighter" as WalletType,
    name: "Freighter",
    description: "Official Stellar browser wallet extension created by SDF.",
    iconUrl: "https://www.freighter.app/favicon.ico",
    downloadUrl: "https://www.freighter.app/",
    badge: "Recommended",
  },
  {
    id: "xbull" as WalletType,
    name: "xBull Wallet",
    description: "Powerful web & browser extension wallet for Stellar & Soroban.",
    iconUrl: "https://xbull.app/favicon.ico",
    downloadUrl: "https://xbull.app/",
  },
  {
    id: "albedo" as WalletType,
    name: "Albedo",
    description: "Web-based web3 wallet for Stellar without extension requirement.",
    iconUrl: "https://albedo.link/favicon.ico",
    downloadUrl: "https://albedo.link/",
  },
];

export function WalletModal() {
  const { isModalOpen, setIsModalOpen, connect, isConnecting, error, address, walletType, disconnect } = useWallet();

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Connect Stellar Wallet"
      description="Select your preferred wallet to interact with SubscriptX Soroban smart contracts."
      maxWidth="md"
    >
      <div className="space-y-4">
        {address ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Connected with {walletType?.toUpperCase()}
            </div>
            <p className="text-xs font-mono break-all text-emerald-200/80 bg-slate-950/60 p-2.5 rounded-xl border border-emerald-500/20">
              {address}
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="w-full text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
              >
                Disconnect Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {WALLETS.map((w) => (
              <button
                key={w.id}
                onClick={() => connect(w.id)}
                disabled={isConnecting}
                className="group relative flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left transition-all duration-200 hover:border-blue-500/50 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/80 text-blue-400 font-bold group-hover:scale-105 transition-transform">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{w.name}</span>
                      {w.badge && (
                        <span className="rounded-full bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                          {w.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{w.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400">
                  <a
                    href={w.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 hover:text-white transition-colors"
                    title={`Get ${w.name}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          Stellar Soroban Testnet Active
        </div>
      </div>
    </Modal>
  );
}
