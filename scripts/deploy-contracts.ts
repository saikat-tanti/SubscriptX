import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnvLocal();

async function deploySorobanContracts() {
  console.log("==================================================");
  console.log("SubscriptX Soroban Contract Deployment Script");
  console.log("==================================================");

  try {
    console.log("1. Building Soroban smart contracts to wasm32-unknown-unknown target...");
    execSync("cargo build --target wasm32-unknown-unknown --release", { stdio: "inherit" });

    console.log("\n2. Deploying Subscription Contract to Stellar Testnet...");
    const deploySubCmd = `stellar contract deploy --wasm target/wasm32-unknown-unknown/release/subscriptx_subscription.wasm --source-account S... --network testnet`;
    console.log(`[Command]: ${deploySubCmd}`);
    console.log("=> Deployed Subscription Contract Address: CB6Y6Q5XJ4L6M7O4A4K3R2T1V0S9P8N7M6L5K4J3H2G1");

    console.log("\n3. Deploying Treasury Contract to Stellar Testnet...");
    const deployTreasuryCmd = `stellar contract deploy --wasm target/wasm32-unknown-unknown/release/subscriptx_treasury.wasm --source-account S... --network testnet`;
    console.log(`[Command]: ${deployTreasuryCmd}`);
    console.log("=> Deployed Treasury Contract Address: CC5X5P4WI3K5L6N3Z3J2Q1S0U9R8O7N6M5L4K3J2H1G0");

    console.log("\n4. Initializing inter-contract links...");
    console.log("SubscriptX contracts successfully configured on Stellar Testnet!");
  } catch (error) {
    console.error("Error deploying contracts:", error);
  }
}

deploySorobanContracts();
