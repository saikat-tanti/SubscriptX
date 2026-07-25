import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID,
  ALBEDO_ID,
} from "@creit.tech/stellar-wallets-kit";
import { WalletType } from "@/types";

const TESTNET_PASSPHRASE = "Test Stellar Network ; September 2015";

class WalletKitManager {
  private kit: StellarWalletsKit | null = null;
  private _activeWalletId: string = FREIGHTER_ID;

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

  public setActiveWalletType(walletType: WalletType) {
    if (walletType === "xbull") this._activeWalletId = XBULL_ID;
    else if (walletType === "albedo") this._activeWalletId = ALBEDO_ID;
    else this._activeWalletId = FREIGHTER_ID;
    this.kit?.setWallet(this._activeWalletId);
  }

  public async connectWallet(
    walletId: WalletType
  ): Promise<{ address: string; walletType: WalletType }> {
    if (!this.kit) throw new Error("Wallet kit not initialized");

    this.setActiveWalletType(walletId);

    const { address } = await this.kit.getAddress();
    if (!address) throw new Error("No address returned from wallet extension");

    return { address, walletType: walletId };
  }

  public async disconnect(): Promise<void> {
    await this.kit?.disconnect();
  }

  /**
   * Returns a SignTxFunction compatible with TraceChain's pipeline:
   * (xdrString: string) => Promise<{ signedXDR: string }>
   */
  public getSignTxFn(): (xdrString: string) => Promise<{ signedXDR: string }> {
    return async (xdrString: string): Promise<{ signedXDR: string }> => {
      if (!this.kit) throw new Error("Wallet kit not initialized");

      this.kit.setWallet(this._activeWalletId);

      const res = await this.kit.signTransaction(xdrString, {
        networkPassphrase: TESTNET_PASSPHRASE,
      });

      const signed =
        res?.signedTxXdr || (res as any)?.signedTx || (res as any);

      if (!signed || typeof signed !== "string" || signed.length === 0) {
        throw new Error("Wallet did not return a signed transaction.");
      }

      return { signedXDR: signed };
    };
  }
}

export const walletKitManager = new WalletKitManager();
