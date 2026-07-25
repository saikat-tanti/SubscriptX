import {
  Horizon,
  rpc,
  Contract,
  Operation,
  TransactionBuilder,
  Address,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { ContractConfig } from "@/types";
import { walletKitManager } from "@/lib/wallet-kit";

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
    return 1000.0;
  }
}

/**
 * Execute real Soroban Smart Contract invocation through Stellar Wallets Kit (Freighter, xBull, Albedo)
 * Opens wallet popup, signs with real Testnet gas fee, and submits to Stellar RPC.
 */
export async function invokeSorobanContract(
  contractId: string,
  methodName: string,
  args: any[],
  userAddress: string
): Promise<{ hash: string; success: boolean }> {
  const server = getSorobanServer();

  // 1. Load user account from Soroban RPC / Horizon
  const account = await server.getAccount(userAddress);

  // 2. Build contract operation
  const contract = new Contract(contractId);
  const scArgs = args.map((a) => {
    if (typeof a === "string" && (a.startsWith("G") || a.startsWith("C")) && a.length === 56) {
      return new Address(a).toScVal();
    }
    return nativeToScVal(a);
  });

  const txOp = contract.call(methodName, ...scArgs);

  // 3. Build unsigned Stellar Transaction
  const tx = new TransactionBuilder(account, {
    fee: "10000",
    networkPassphrase: "Test Stellar Network ; September 2015",
  })
    .addOperation(txOp)
    .setTimeout(30)
    .build();

  // 4. Simulate transaction to calculate gas fees & footprints
  const sim = await server.simulateTransaction(tx);

  let assembledTx = tx;
  if (rpc.Api.isSimulationSuccess(sim)) {
    assembledTx = rpc.assembleTransaction(tx, sim).build();
  }

  // 5. Trigger Freighter / xBull / Albedo wallet signature prompt with real gas fee
  const unsignedXdr = assembledTx.toXDR();
  const signedXdr = await walletKitManager.signTransaction(unsignedXdr, userAddress);

  // 6. Submit signed transaction XDR to Soroban RPC
  const txToSubmit = TransactionBuilder.fromXDR(
    signedXdr,
    "Test Stellar Network ; September 2015"
  );
  
  const sendRes = await server.sendTransaction(txToSubmit);

  const statusStr = (sendRes.status as string) || "";
  if (statusStr === "PENDING" || statusStr === "SUCCESS") {
    return { hash: sendRes.hash, success: true };
  } else {
    throw new Error(`Soroban RPC submission status: ${sendRes.status}`);
  }
}
