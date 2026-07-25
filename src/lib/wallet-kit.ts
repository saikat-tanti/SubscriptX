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
   * Returns a signTransaction function bound to the currently active wallet.
   * This function triggers the real browser wallet-extension popup (Freighter /
   * xBull / Albedo) so the user can approve and sign the transaction.
   *
   * API (v1.9.5): kit.signTransaction(xdr, { networkPassphrase?, address? })
   *               → { signedTxXdr: string }
   */
  public getSignTransactionFn(): (xdr: string, signerAddress?: string) => Promise<string> {
    return async (xdr: string, signerAddress?: string): Promise<string> => {
      if (!this.kit) throw new Error("Wallet kit not initialized");

      // Make sure correct wallet module is active
      this.kit.setWallet(this._activeWalletId);

      const { signedTxXdr } = await this.kit.signTransaction(xdr, {
        networkPassphrase: TESTNET_PASSPHRASE,
        address: signerAddress,
      });

      if (!signedTxXdr || signedTxXdr.length === 0) {
        throw new Error("Wallet returned an empty signed transaction.");
      }

      return signedTxXdr;
    };
  }
}

export const walletKitManager = new WalletKitManager();
