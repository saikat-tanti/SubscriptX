import { Horizon, rpc } from "@stellar/stellar-sdk";
import { ContractConfig } from "@/types";

export const DEFAULT_CONFIG: ContractConfig = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET",
  sorobanRpcUrl:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
  horizonUrl:
    process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org",
  subscriptionContractId:
    process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID ||
    "CB6Y6Q5XJ4L6M7O4A4K3R2T1V0S9P8N7M6L5K4J3H2G1",
  treasuryContractId:
    process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID ||
    "CC5X5P4WI3K5L6N3Z3J2Q1S0U9R8O7N6M5L4K3J2H1G0",
};

export const getSorobanServer = () => {
  return new rpc.Server(DEFAULT_CONFIG.sorobanRpcUrl);
};

export const getHorizonServer = () => {
  return new Horizon.Server(DEFAULT_CONFIG.horizonUrl);
};

/**
  * Fetch account balance in XLM from Stellar Horizon API
  */
export async function fetchAccountBalance(address: string): Promise<number> {
  try {
    const server = getHorizonServer();
    const account = await server.loadAccount(address);
    const nativeBalance = account.balances.find(
      (b) => b.asset_type === "native"
    );
    return nativeBalance ? parseFloat(nativeBalance.balance) : 1000.0;
  } catch (err) {
    console.warn("Could not fetch horizon account balance, returning testnet default", err);
    return 1000.0; // Testnet fallback default
  }
}
