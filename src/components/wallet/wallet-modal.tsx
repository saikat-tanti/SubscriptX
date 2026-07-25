"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { useWallet } from "@/hooks/use-wallet";
import { WalletType } from "@/types";
import { Wallet, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const WALLETS = [
  {
    id: "freighter" as WalletType,
    name: "Freighter Wallet",
    description: "Official Stellar browser wallet extension created by SDF.",
    downloadUrl: "https://www.freighter.app/",
    badge: "Recommended",
  },
  {
    id: "xbull" as WalletType,
    name: "xBull Wallet",
    description: "Powerful web & browser extension wallet for Stellar & Soroban.",
    downloadUrl: "https://xbull.app/",
  },
  {
    id: "albedo" as WalletType,
    name: "Albedo Wallet",
    description: "Web-based web3 wallet for Stellar without extension requirement.",
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
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-emerald-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Connected with {walletType?.toUpperCase()}
            </div>
            <p className="text-xs font-mono break-all text-emerald-950 bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
              {address}
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
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
                className="group relative flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold group-hover:scale-105 transition-transform">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{w.name}</span>
                      {w.badge && (
                        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          {w.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{w.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-600">
                  <a
                    href={w.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 hover:text-slate-700 transition-colors"
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
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          Stellar Soroban Testnet Connected
        </div>
      </div>
    </Modal>
  );
}
