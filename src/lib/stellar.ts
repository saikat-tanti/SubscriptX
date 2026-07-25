import {
  Horizon,
  rpc,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  StrKey,
  xdr,
} from "@stellar/stellar-sdk";
import { ContractConfig } from "@/types";

const TESTNET_PASSPHRASE = Networks.TESTNET;

const rawSubId = process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID || "";
const rawTreasuryId = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID || "";

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

async function waitForTransaction(
  server: rpc.Server,
  hash: string,
  timeoutMs = 30000
): Promise<rpc.Api.GetTransactionResponse> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await server.getTransaction(hash);
    if (res.status !== "NOT_FOUND") return res;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Transaction ${hash} timed out after ${timeoutMs / 1000}s`);
}

/**
 * Convert SorobanCredentialsAddress entries → SorobanCredentialsSourceAccount
 * when the auth address equals the transaction source account.
 *
 * WHY: After rpc.assembleTransaction(), the tx contains unsigned
 * SorobanCredentialsAddress auth entries (from require_auth() calls).
 * Freighter v5 shows "Signing this transaction is not possible at the moment"
 * because it cannot sign embedded auth entries via signTransaction().
 *
 * FIX: Since userAddress IS the transaction source account, we replace those
 * address credentials with SorobanCredentialsSourceAccount. Soroban validates
 * these for free from the outer transaction's signature — no extra signAuthEntry
 * popup required, and Freighter's signTransaction works without error.
 */
function promoteToSourceAccountAuth(
  authEntries: xdr.SorobanAuthorizationEntry[],
  sourceAddress: string
): xdr.SorobanAuthorizationEntry[] {
  return authEntries.map((entry) => {
    const cred = entry.credentials();

    // Only touch address-type credentials
    if (cred.switch().name !== "sorobanCredentialsAddress") return entry;

    const scAddr = cred.address().address();

    // Only handle account addresses (not contract addresses)
    if (scAddr.switch().name !== "scAddressTypeAccount") return entry;

    // Decode the entry's account ID to a G… address
    const entryAddress = StrKey.encodeEd25519PublicKey(
      scAddr.accountId().ed25519()
    );

    // Replace with source account credentials when address matches tx source
    if (entryAddress === sourceAddress) {
      return new xdr.SorobanAuthorizationEntry({
        credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
        rootInvocation: entry.rootInvocation(),
      });
    }

    return entry;
  });
}

/**
 * Execute a Soroban contract invocation on Stellar Testnet.
 *
 * Full flow:
 *  1. Load account (sequence number)
 *  2. Build InvokeHostFunction transaction
 *  3. Simulate → get footprint + auth entries
 *  4. Assemble (inject footprint + fee)
 *  5. Promote auth entries to source account auth (avoids Freighter "not possible")
 *  6. Open Freighter popup → user signs outer transaction
 *  7. Submit signed XDR to Soroban RPC
 *  8. Poll until confirmed
 */
export async function invokeSorobanContract(
  contractId: string,
  methodName: string,
  args: xdr.ScVal[],
  userAddress: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<{ hash: string; success: boolean }> {
  if (!isValidContractId(contractId)) {
    throw new Error(
      `Invalid Soroban contract ID "${contractId}". ` +
        "Set NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID / NEXT_PUBLIC_TREASURY_CONTRACT_ID in .env.local."
    );
  }

  const server = getSorobanServer();

  // ── 1. Load account ───────────────────────────────────────────────────────
  let stellarAccount;
  try {
    stellarAccount = await server.getAccount(userAddress);
  } catch {
    throw new Error(
      "Could not load your Stellar account from Soroban RPC. " +
        "Make sure your wallet is funded on Testnet (https://friendbot.stellar.org)."
    );
  }

  // ── 2. Build transaction ──────────────────────────────────────────────────
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(stellarAccount, {
    fee: String(Number(BASE_FEE) * 10),
    networkPassphrase: TESTNET_PASSPHRASE,
  })
    .addOperation(contract.call(methodName, ...args))
    .setTimeout(60)
    .build();

  // ── 3. Simulate ───────────────────────────────────────────────────────────
  const simulation = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Soroban simulation failed: ${simulation.error}`);
  }

  // ── 4. Assemble (inject footprint + updated fee) ──────────────────────────
  const assembled = rpc.assembleTransaction(tx, simulation).build();

  // ── 5. Promote address auth → source account auth ─────────────────────────
  // This is the key fix: mutate the assembled envelope's auth entries before
  // presenting it to Freighter so it doesn't show "not possible".
  const envelope = assembled.toEnvelope();
  const innerTx = envelope.v1().tx();
  const ops = innerTx.operations();

  if (ops.length > 0) {
    const body = ops[0].body();
    if (body.switch().name === "invokeHostFunction") {
      const ihf = body.invokeHostFunctionOp();
      const updatedAuth = promoteToSourceAccountAuth(ihf.auth(), userAddress);
      ihf.auth(updatedAuth);
    }
  }

  // Serialize the mutated envelope to base64 XDR
  const unsignedXdr = envelope.toXDR("base64");

  // ── 6. Open wallet popup → user signs outer transaction ───────────────────
  let signedXdr: string;
  try {
    signedXdr = await signTransaction(unsignedXdr);
  } catch (err: any) {
    const msg = String(err?.message ?? err).toLowerCase();
    if (
      msg.includes("declined") ||
      msg.includes("rejected") ||
      msg.includes("cancel") ||
      msg.includes("user")
    ) {
      throw new Error("Transaction was rejected by your wallet.");
    }
    throw new Error(`Wallet signing failed: ${err?.message ?? err}`);
  }

  if (!signedXdr || signedXdr === unsignedXdr) {
    throw new Error("Wallet did not return a signed transaction.");
  }

  // ── 7. Submit to Soroban RPC ──────────────────────────────────────────────
  const signedTx = TransactionBuilder.fromXDR(signedXdr, TESTNET_PASSPHRASE);
  const sendResult = await server.sendTransaction(signedTx);

  if ((sendResult.status as string) === "ERROR") {
    const errCode =
      (sendResult as any).errorResult?.result?.switch?.()?.name ?? "UNKNOWN";
    throw new Error(`Transaction submission failed: ${errCode}`);
  }

  // ── 8. Poll for confirmation ──────────────────────────────────────────────
  const confirmed = await waitForTransaction(server, sendResult.hash);
  if ((confirmed.status as string) === "FAILED") {
    throw new Error(`Transaction ${sendResult.hash} failed on-chain.`);
  }

  return { hash: sendResult.hash, success: true };
}
