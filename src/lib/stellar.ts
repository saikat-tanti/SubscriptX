import {
  rpc,
  Contract,
  TransactionBuilder,
  Networks,
  Address,
  nativeToScVal,
  scValToNative,
  StrKey,
  xdr,
} from "@stellar/stellar-sdk";
import { ContractConfig, Plan } from "@/types";

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
  new rpc.Server(DEFAULT_CONFIG.sorobanRpcUrl);

export async function fetchAccountBalance(address: string): Promise<number> {
  try {
    const res = await fetch(
      `${DEFAULT_CONFIG.horizonUrl}/accounts/${address}`
    );
    if (!res.ok) return 0;
    const data = await res.json();
    const native = data.balances?.find(
      (b: any) => b.asset_type === "native"
    );
    return native ? parseFloat(native.balance) : 0;
  } catch {
    return 0;
  }
}

/**
 * Reads all live plans directly from the deployed Soroban Subscription smart contract on Testnet
 */
export async function fetchOnChainPlans(): Promise<Plan[]> {
  try {
    const server = getSorobanServer();
    const contract = new Contract(DEFAULT_CONFIG.subscriptionContractId);

    const dummyAccount = await server.getAccount(
      "GCD2TPYJAXQCO6BHHO3LT4TVGJ3JMVFW2BLEOWFKPW2GXWIAWNBSJJSF"
    );

    const tx = new TransactionBuilder(dummyAccount, {
      fee: "10000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call("get_all_plans"))
      .setTimeout(300)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim) || !sim.result?.retval) return [];

    const rawPlans = scValToNative(sim.result.retval);
    if (!Array.isArray(rawPlans)) return [];

    return rawPlans.map((p: any) => ({
      id: String(p.id),
      merchant: String(p.merchant),
      title: String(p.title),
      description: String(p.description),
      priceXlm: Number(p.price_xlm),
      intervalSecs: Number(p.interval_secs),
      maxSubscribers: Number(p.max_subscribers),
      subscribersCount: Number(p.subscribers_count),
      isActive: Boolean(p.is_active),
      createdAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn("Could not fetch on-chain plans:", err);
    return [];
  }
}

export type SignTxFunction = (
  xdrString: string
) => Promise<{ signedXDR: string }>;

/**
 * Executes a real Soroban contract invocation using the TraceChain pipeline:
 * 1. Get source account
 * 2. Build Transaction with contract operation
 * 3. server.prepareTransaction(tx) -> simulates gas, footprints, and formats auth
 * 4. signTx(preparedTx.toXDR()) -> opens Freighter / StellarWalletsKit popup
 * 5. server.sendTransaction(signedTx) -> submits signed XDR to RPC
 * 6. Poll server.getTransaction(hash) -> confirms on-chain execution
 */
export async function invokeSorobanContract(
  contractId: string,
  methodName: string,
  args: xdr.ScVal[],
  userAddress: string,
  signTx: SignTxFunction
): Promise<{ hash: string; success: boolean }> {
  if (!isValidContractId(contractId)) {
    throw new Error(
      `Invalid Soroban contract ID "${contractId}". ` +
        "Set NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID / NEXT_PUBLIC_TREASURY_CONTRACT_ID in .env.local."
    );
  }

  const server = getSorobanServer();

  // 1. Fetch account details from Soroban RPC
  let sourceAccount;
  try {
    sourceAccount = await server.getAccount(userAddress);
  } catch {
    throw new Error(
      "Could not load your Stellar account from Soroban RPC. " +
        "Make sure your wallet is funded on Testnet (https://friendbot.stellar.org)."
    );
  }

  // 2. Build the contract call operation
  const contract = new Contract(contractId);
  const operation = contract.call(methodName, ...args);

  // 3. Build base transaction
  const tx = new TransactionBuilder(sourceAccount, {
    fee: "10000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();

  // 4. Prepare transaction (simulates to get footprint & resource limits)
  const preparedTx = await server.prepareTransaction(tx);

  // 5. Ask user to sign via wallet
  const { signedXDR } = await signTx(preparedTx.toXDR());
  const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);

  // 6. Submit to Soroban RPC
  const response = await server.sendTransaction(signedTx);

  if (response.status === "ERROR") {
    console.error("Submit Error:", response);
    const errCode =
      (response as any).errorResult?.result?.switch?.()?.name ?? "UNKNOWN";
    throw new Error(`Transaction submission failed: ${errCode}`);
  }

  // 7. Poll for completion
  let statusResponse = await server.getTransaction(response.hash);
  while (statusResponse.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    statusResponse = await server.getTransaction(response.hash);
  }

  if (statusResponse.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error("Transaction failed on-chain.");
  }

  return { hash: response.hash, success: true };
}
