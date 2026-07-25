"use client";

import React, { useState, useEffect } from "react";
import { contractStore } from "@/lib/mock-indexer";
import { TransactionRecord } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, truncateAddress, getExplorerTxUrl } from "@/lib/utils";
import { History, Search, ExternalLink } from "lucide-react";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setTransactions(contractStore.getTransactions());
  }, []);

  const filteredTx = transactions.filter((tx) => {
    const matchesHash = tx.hash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSender = tx.sender.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = tx.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesHash || matchesSender || matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info">On-Chain Activity Feed</Badge>
            <span className="text-xs font-mono text-slate-500">Stellar Testnet Ledger Logs</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Transaction History</h1>
          <p className="text-sm text-slate-500">
            Immutable log of subscription plan creations, recurring payments, and cancellations.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by transaction hash or wallet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <Card className="overflow-hidden border-slate-200 bg-white">
        <CardContent className="p-0">
          {filteredTx.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-3">
              <History className="h-10 w-10 mx-auto text-slate-400 animate-pulse" />
              <p className="text-sm font-medium">No matching transaction records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Transaction Hash</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTx.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-semibold">
                        {truncateAddress(tx.hash, 8)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 capitalize">
                        {tx.type.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600">
                        {tx.amount > 0 ? `+${tx.amount} XLM` : "0 XLM"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            tx.status === "success"
                              ? "success"
                              : tx.status === "pending"
                              ? "pending"
                              : "danger"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono font-medium">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={getExplorerTxUrl(tx.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
