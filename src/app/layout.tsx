import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/hooks/use-wallet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastContainer } from "@/components/ui/toast";
import { WalletModal } from "@/components/wallet/wallet-modal";

export const metadata: Metadata = {
  title: "SubscriptX | Decentralized Subscription Billing Platform",
  description:
    "Blockchain-powered subscription management platform built on Stellar Soroban smart contracts. Transparent payments, multi-wallet support, and treasury vault custody.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between">
        <WalletProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastContainer />
          <WalletModal />
        </WalletProvider>
      </body>
    </html>
  );
}
