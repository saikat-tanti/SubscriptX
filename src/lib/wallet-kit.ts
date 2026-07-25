import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID,
  ALBEDO_ID,
} from "@creit.tech/stellar-wallets-kit";
import { WalletType } from "@/types";

class WalletKitManager {
  private kit: StellarWalletsKit | null = null;

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

    let targetModuleId = FREIGHTER_ID;
    if (walletId === "xbull") targetModuleId = XBULL_ID;
    if (walletId === "albedo") targetModuleId = ALBEDO_ID;

    this.kit.setWallet(targetModuleId);
    
    const { address } = await this.kit.getAddress();
    
    if (!address) {
      throw new Error("No address returned from wallet");
    }

    return { address, walletType: walletId };
  }

  public async disconnect(): Promise<void> {
    if (this.kit) {
      await this.kit.disconnect();
    }
  }

  public async signTransaction(xdr: string, publicKey: string): Promise<string> {
    if (!this.kit) {
      throw new Error("Wallet kit not initialized");
    }

    const { result } = await (this.kit as any).signTransaction({
      xdr,
      publicKey,
      network: WalletNetwork.TESTNET,
    });

    return result || xdr;
  }
}

export const walletKitManager = new WalletKitManager();
