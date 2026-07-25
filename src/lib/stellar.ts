import {
  Horizon,
  rpc,
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
  StrKey,
  BASE_FEE,
  Networks,
} from "@stellar/stellar-sdk";
import { ContractConfig } from "@/types";

const TESTNET_PASSPHRASE = Networks.TESTNET; // "Test Stellar Network ; September 2015"

const rawSubId = process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID || "";
const rawTreasuryId = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID || "";

// Validate that IDs are properly-encoded 56-char Soroban contract addresses
const isValidContractId = (id: string) =>
  typeof id === "string" && id.length === 56 && StrKey.isValidContract(id);

export const DEFAULT_CONFIG: ContractConfig = {
  network: "TESTNET",
  sorobanRpcUrl:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
    "https://soroban-testnet.stellar.org",
  horizonUrl:
    process.env.NEXT_PUBLIC_HORIZON_URL ||
    "https://horizon-testnet.stellar.org",
  subscriptionContractId: isValidContractId(rawSubId)
    ? rawSubId
    : StrKey.encodeContract(Buffer.alloc(32, 1)),
  treasuryContractId: isValidContractId(rawTreasuryId)
    ? rawTreasuryId
    : StrKey.encodeContract(Buffer.alloc(32, 2)),
};

export const getSorobanServer = () =>
  new rpc.Server(DEFAULT_CONFIG.sorobanRpcUrl, { allowHttp: false });

export const getHorizonServer = () =>
  new Horizon.Server(DEFAULT_CONFIG.horizonUrl);

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
    return nativeBalance ? parseFloat(nativeBalance.balance) : 0;
  } catch {
    return 0;
  }
}

/**
 * Poll Soroban RPC until a sent transaction reaches a terminal state (SUCCESS or FAILED).
 */
async function waitForTransaction(
  server: rpc.Server,
  hash: string,
  timeoutMs = 30000
): Promise<rpc.Api.GetTransactionResponse> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await server.getTransaction(hash);
    if (res.status !== "NOT_FOUND") {
      return res;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Transaction ${hash} timed out after ${timeoutMs}ms`);
}

/**
 * Build, simulate, assemble, sign via connected wallet, submit, and confirm a
 * Soroban smart-contract invocation on Stellar Testnet.
 *
 * Step-by-step:
 *   1. Load account sequence from Horizon
 *   2. Build the InvokeHostFunction transaction
 *   3. Simulate via Soroban RPC to obtain fee & footprint
 *   4. Assemble (inject simulation result)
 *   5. Open wallet extension popup → user signs → returns signed XDR
 *   6. Submit signed XDR to Soroban RPC
 *   7. Poll for confirmation
 *   8. Return transaction hash
 */
export async function invokeSorobanContract(
  contractId: string,
  methodName: string,
  args: (string | number | boolean)[],
  userAddress: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<{ hash: string; success: boolean }> {
  // ── Validate contract ID ────────────────────────────────────────────────
  if (!isValidContractId(contractId)) {
    throw new Error(
      `Invalid Soroban contract ID "${contractId}". ` +
        "Deploy your contracts first and set NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID " +
        "/ NEXT_PUBLIC_TREASURY_CONTRACT_ID in .env.local."
    );
  }

  const server = getSorobanServer();

  // ── 1. Load account (sequence number) ──────────────────────────────────
  let stellarAccount;
  try {
    stellarAccount = await server.getAccount(userAddress);
  } catch (err) {
    throw new Error(
      "Could not load your Stellar account from Soroban RPC. " +
        "Make sure your wallet address is funded on Testnet (use friendbot.stellar.org)."
    );
  }

  // ── 2. Build transaction ────────────────────────────────────────────────
  const contract = new Contract(contractId);

  const scArgs = args.map((a) => {
    if (
      typeof a === "string" &&
      (a.startsWith("G") || a.startsWith("C")) &&
      a.length === 56
    ) {
      return new Address(a).toScVal();
    }
    return nativeToScVal(a);
  });

  const tx = new TransactionBuilder(stellarAccount, {
    fee: String(Number(BASE_FEE) * 10), // start with 10× base; simulation will override
    networkPassphrase: TESTNET_PASSPHRASE,
  })
    .addOperation(contract.call(methodName, ...scArgs))
    .setTimeout(60)
    .build();

  // ── 3. Simulate ─────────────────────────────────────────────────────────
  const simulation = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(
      `Soroban simulation failed: ${simulation.error}`
    );
  }

  // ── 4. Assemble (inject footprint + updated fee from simulation) ─────────
  const preparedTx = rpc.assembleTransaction(tx, simulation).build();
  const unsignedXdr = preparedTx.toXDR();

  // ── 5. Open wallet popup → user signs ──────────────────────────────────
  //       signTransaction is injected from use-wallet (Stellar Wallets Kit)
  let signedXdr: string;
  try {
    signedXdr = await signTransaction(unsignedXdr);
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    if (
      msg.toLowerCase().includes("declined") ||
      msg.toLowerCase().includes("rejected") ||
      msg.toLowerCase().includes("user") ||
      msg.toLowerCase().includes("cancel")
    ) {
      throw new Error("Transaction was rejected by your wallet.");
    }
    throw new Error(`Wallet signing failed: ${msg}`);
  }

  if (!signedXdr || signedXdr === unsignedXdr) {
    throw new Error("Wallet did not return a signed transaction.");
  }

  // ── 6. Submit to Soroban RPC ─────────────────────────────────────────────
  const signedTx = TransactionBuilder.fromXDR(signedXdr, TESTNET_PASSPHRASE);
  const sendResult = await server.sendTransaction(signedTx);

  const sendStatus = sendResult.status as string;
  if (sendStatus === "ERROR") {
    const errCode = (sendResult as any).errorResult?.result?.switch?.()?.name ?? "UNKNOWN";
    throw new Error(`Transaction submission failed with code: ${errCode}`);
  }

  const txHash = sendResult.hash;

  // ── 7. Poll for confirmation ─────────────────────────────────────────────
  const confirmation = await waitForTransaction(server, txHash);

  if ((confirmation.status as string) === "FAILED") {
    throw new Error(`Transaction ${txHash} was rejected by the Soroban network.`);
  }

  return { hash: txHash, success: true };
}
