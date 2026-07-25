"use client";

import React from "react";
import { useWallet } from "@/hooks/use-wallet";
import { DEFAULT_CONFIG } from "@/lib/stellar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getExplorerAccountUrl, getExplorerContractUrl } from "@/lib/utils";
import {
  Wallet,
  ExternalLink,
  Layers,
  LogOut,
  RefreshCw,
} from "lucide-react";

export default function SettingsPage() {
  const { isConnected, address, walletType, balanceXlm, disconnect, setIsModalOpen, refreshBalance } = useWallet();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="info">Configuration & Session</Badge>
          <span className="text-xs font-mono text-slate-500">Network & Contracts</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Platform Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your connected wallet session, RPC endpoints, and Soroban contract deployment parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Wallet Session Details */}
        <Card className="space-y-4">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-lg text-slate-900">Wallet Connection</CardTitle>
              </div>
              <Badge variant={isConnected ? "success" : "neutral"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <CardDescription>Active wallet provider & session state</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {isConnected && address ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Public Key (G-Address)
                  </p>
                  <p className="font-mono text-xs text-slate-900 break-all font-semibold">{address}</p>

                  <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Provider:</span>
                    <span className="font-bold text-indigo-600 uppercase">{walletType}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Balance:</span>
                    <span className="font-mono font-bold text-emerald-600">{balanceXlm} XLM</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={getExplorerAccountUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full gap-2 text-xs">
                      View on Stellar Expert <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                  <Button
                    onClick={refreshBalance}
                    variant="secondary"
                    className="gap-2 text-xs shrink-0"
                    title="Refresh Balance"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  onClick={disconnect}
                  variant="danger"
                  className="w-full gap-2 text-xs mt-2"
                >
                  <LogOut className="h-4 w-4" /> Disconnect Wallet Session
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-slate-500">No wallet currently connected.</p>
                <Button onClick={() => setIsModalOpen(true)} variant="primary" className="w-full">
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Network & Contract Deployment Details */}
        <Card className="space-y-4">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg text-slate-900">Soroban Smart Contracts</CardTitle>
            </div>
            <CardDescription>Environment variables & contract deployment IDs</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-semibold tracking-wider">
                  Network:
                </span>
                <span className="ml-2 font-mono font-bold text-emerald-600">
                  {DEFAULT_CONFIG.network}
                </span>
              </div>

              <div>
                <span className="text-slate-500 uppercase font-semibold tracking-wider">
                  Soroban RPC Endpoint:
                </span>
                <p className="font-mono text-slate-700 mt-0.5 break-all font-medium">
                  {DEFAULT_CONFIG.sorobanRpcUrl}
                </p>
              </div>

              <div>
                <span className="text-slate-500 uppercase font-semibold tracking-wider">
                  Horizon API Endpoint:
                </span>
                <p className="font-mono text-slate-700 mt-0.5 break-all font-medium">
                  {DEFAULT_CONFIG.horizonUrl}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="text-slate-500 uppercase font-semibold tracking-wider">
                  Subscription Contract ID:
                </span>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-mono text-indigo-600 font-semibold text-[11px] truncate max-w-[220px]">
                    {DEFAULT_CONFIG.subscriptionContractId}
                  </p>
                  <a
                    href={getExplorerContractUrl(DEFAULT_CONFIG.subscriptionContractId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-600"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div>
                <span className="text-slate-500 uppercase font-semibold tracking-wider">
                  Treasury Contract ID:
                </span>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-mono text-purple-600 font-semibold text-[11px] truncate max-w-[220px]">
                    {DEFAULT_CONFIG.treasuryContractId}
                  </p>
                  <a
                    href={getExplorerContractUrl(DEFAULT_CONFIG.treasuryContractId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-purple-600"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
