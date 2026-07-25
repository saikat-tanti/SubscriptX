import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID,
  ALBEDO_ID,
} from "@creit.tech/stellar-wallets-kit";
import {
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import { WalletType } from "@/types";

class WalletKitManager {
  private kit: StellarWalletsKit | null = null;
  private activeWalletType: WalletType = "freighter";

  constructor() {
    if (typeof window !== "undefined") {
      this.kit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: FREIGHTER_ID,
        modules: allowAllModules(),
      });
    }
  }

  public getKit(): StellarWalletsKit | null {
    return this.kit;
  }

  public async connectWallet(walletId: WalletType): Promise<{ address: string; walletType: WalletType }> {
    if (!this.kit) {
      throw new Error("Wallet kit not initialized");
    }

    this.activeWalletType = walletId;
    let targetModuleId = FREIGHTER_ID;
    if (walletId === "xbull") targetModuleId = XBULL_ID;
    if (walletId === "albedo") targetModuleId = ALBEDO_ID;

    this.kit.setWallet(targetModuleId);

    // Direct Freighter check
    if (walletId === "freighter" && typeof window !== "undefined" && (window as any).freighter) {
      const freighterRes = await (window as any).freighter.getPublicKey();
      if (freighterRes) {
        return { address: freighterRes, walletType: "freighter" };
      }
    }

    const { address } = await this.kit.getAddress();
    
    if (!address) {
      throw new Error("No address returned from wallet extension");
    }

    return { address, walletType: walletId };
  }

  public async disconnect(): Promise<void> {
    if (this.kit) {
      await this.kit.disconnect();
    }
  }

  public async signTransaction(xdr: string, publicKey: string): Promise<string> {
    console.log("WalletKitManager: Triggering wallet signature modal for address:", publicKey);

    // 1. Direct Freighter API call if Freighter extension is present
    if (typeof window !== "undefined" && (window as any).freighter) {
      try {
        console.log("Directly opening Freighter wallet extension popup...");
        const signed = await (freighterSignTransaction as any)(xdr, {
          network: "TESTNET",
          networkPassphrase: "Test Stellar Network ; September 2015",
          accountToSign: publicKey,
        });

        if (typeof signed === "string" && signed.length > 0) {
          return signed;
        }
      } catch (err: any) {
        console.warn("Freighter direct signing notice:", err);
        const msg = err?.message || String(err);
        if (msg.includes("declined") || msg.includes("rejected") || msg.includes("User")) {
          throw new Error("Transaction was rejected by your wallet.");
        }
      }
    }

    // 2. StellarWalletsKit module invocation fallback
    if (this.kit) {
      let targetModuleId = FREIGHTER_ID;
      if (this.activeWalletType === "xbull") targetModuleId = XBULL_ID;
      if (this.activeWalletType === "albedo") targetModuleId = ALBEDO_ID;

      this.kit.setWallet(targetModuleId);

      try {
        const response = await (this.kit as any).signTransaction({
          xdr,
          publicKey,
          network: WalletNetwork.TESTNET,
        });

        const signedXdr = response?.result || response?.signedTx || response;
        if (typeof signedXdr === "string" && signedXdr.length > 0) {
          return signedXdr;
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        if (msg.includes("declined") || msg.includes("rejected") || msg.includes("User")) {
          throw new Error("Transaction was rejected by your wallet.");
        }
        throw err;
      }
    }

    return xdr;
  }
}

export const walletKitManager = new WalletKitManager();
