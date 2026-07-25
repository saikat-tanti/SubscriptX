"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { WalletState, WalletType } from "@/types";
import { walletKitManager } from "@/lib/wallet-kit";
import { fetchAccountBalance } from "@/lib/stellar";
import { toast } from "@/hooks/use-toast";

interface WalletContextType extends WalletState {
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  /** Call this to get a wallet-extension sign function for the current session */
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletType: null,
    balanceXlm: 0,
    isConnecting: false,
    error: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Restore saved wallet session on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("subscriptx_wallet_address");
    const savedType = localStorage.getItem(
      "subscriptx_wallet_type"
    ) as WalletType;

    if (savedAddress && savedType) {
      walletKitManager.setActiveWalletType(savedType);
      setState((prev) => ({
        ...prev,
        isConnected: true,
        address: savedAddress,
        walletType: savedType,
      }));
      fetchAccountBalance(savedAddress).then((balance) =>
        setState((prev) => ({ ...prev, balanceXlm: balance }))
      );
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (state.address) {
      const balance = await fetchAccountBalance(state.address);
      setState((prev) => ({ ...prev, balanceXlm: balance }));
    }
  }, [state.address]);

  const connect = async (walletType: WalletType) => {
    if (!walletType) return;
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { address, walletType: connectedType } =
        await walletKitManager.connectWallet(walletType);

      // Keep walletKitManager in sync with active wallet type
      walletKitManager.setActiveWalletType(connectedType);

      const balance = await fetchAccountBalance(address);

      setState({
        isConnected: true,
        address,
        walletType: connectedType,
        balanceXlm: balance,
        isConnecting: false,
        error: null,
      });

      localStorage.setItem("subscriptx_wallet_address", address);
      localStorage.setItem("subscriptx_wallet_type", connectedType || "");

      toast.success(
        "Wallet Connected",
        `Connected to ${connectedType?.toUpperCase()} on Stellar Testnet`
      );
      setIsModalOpen(false);
    } catch (err: any) {
      const errMsg = err?.message || "Failed to connect wallet";
      let friendlyError = errMsg;

      if (
        errMsg.includes("not found") ||
        errMsg.includes("not installed") ||
        errMsg.includes("not available")
      ) {
        friendlyError = `${walletType.toUpperCase()} extension is not installed in your browser.`;
      } else if (
        errMsg.includes("User declined") ||
        errMsg.includes("rejected")
      ) {
        friendlyError = "Connection request was declined by user.";
      }

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: friendlyError,
      }));

      toast.error("Wallet Error", friendlyError);
    }
  };

  const disconnect = async () => {
    await walletKitManager.disconnect();
    setState({
      isConnected: false,
      address: null,
      walletType: null,
      balanceXlm: 0,
      isConnecting: false,
      error: null,
    });
    localStorage.removeItem("subscriptx_wallet_address");
    localStorage.removeItem("subscriptx_wallet_type");
    toast.info("Wallet Disconnected", "Your wallet session has been cleared");
  };

  /**
   * Exposed to the rest of the app so any hook/component can trigger
   * a real wallet-extension signing popup.
   */
  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      if (!state.isConnected || !state.address) {
        throw new Error("Wallet is not connected.");
      }
      // Delegates to walletKitManager which calls the real browser extension popup
      return walletKitManager.getSignTransactionFn()(xdr, state.address);
    },
    [state.isConnected, state.address]
  );

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        refreshBalance,
        isModalOpen,
        setIsModalOpen,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
