import { StellarWalletsKit, Networks } from "@creit-tech/stellar-wallets-kit";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";
import { WalletType } from "@/types";

let kitInitialized = false;

export const getWalletKit = () => {
  if (typeof window === "undefined") return null;
  if (!kitInitialized) {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: defaultModules(),
      authModal: {
        showInstallLabel: true,
        hideUnsupportedWallets: false,
      },
    });
    kitInitialized = true;
  }
  return StellarWalletsKit;
};

class WalletKitManager {
  public async connectWallet(
    _walletType?: WalletType
  ): Promise<{ address: string; walletType: WalletType }> {
    const kit = getWalletKit();
    if (!kit) throw new Error("Wallet Kit not available");

    // Open the official StellarWalletsKit modal to connect wallet
    const { address } = await StellarWalletsKit.authModal();

    if (!address) {
      throw new Error("No address returned from wallet connection");
    }

    return { address, walletType: "freighter" };
  }

  public async disconnect(): Promise<void> {
    try {
      await StellarWalletsKit.disconnect();
    } catch {
      // ignore
    }
  }

  public getSignTxFn(): (xdrString: string) => Promise<{ signedXDR: string }> {
    return async (xdrString: string): Promise<{ signedXDR: string }> => {
      const kit = getWalletKit();
      if (!kit) throw new Error("Wallet Kit not available");

      const response = await StellarWalletsKit.signTransaction(xdrString, {
        networkPassphrase: Networks.TESTNET,
      });

      if (!response || !response.signedTxXdr) {
        throw new Error("Wallet did not return a signed transaction.");
      }

      return { signedXDR: response.signedTxXdr };
    };
  }
}

export const walletKitManager = new WalletKitManager();
