#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Deploy SubscriptX Soroban contracts to Stellar Testnet and update .env.local

.PREREQUISITES
  - Rust + cargo + wasm32 target installed
  - Stellar CLI installed: https://developers.stellar.org/docs/tools/developer-tools/cli/install
  - A funded Stellar Testnet account (use https://friendbot.stellar.org)

.USAGE
  Set $DEPLOYER_SECRET below (your Stellar Testnet secret key starting with S)
  Then run:  .\scripts\deploy.ps1
#>

# ── CONFIGURE YOUR DEPLOYER KEY ───────────────────────────────────────────────
$DEPLOYER_SECRET = $env:DEPLOYER_SECRET   # Pass via env: $env:DEPLOYER_SECRET="SXXX..." .\scripts\deploy.ps1
if (-not $DEPLOYER_SECRET) {
    Write-Error "ERROR: Set DEPLOYER_SECRET environment variable to your Stellar Testnet secret key (starts with S)."
    exit 1
}

$ROOT = Split-Path $PSScriptRoot -Parent
$ENV_FILE = Join-Path $ROOT ".env.local"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " SubscriptX — Soroban Contract Deployment" -ForegroundColor Cyan
Write-Host " Network: Stellar TESTNET" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ── STEP 1: Add Stellar CLI key ───────────────────────────────────────────────
Write-Host "[1/6] Adding deployer key to Stellar CLI..." -ForegroundColor Yellow
stellar keys add deployer --secret-key $DEPLOYER_SECRET --overwrite

# ── STEP 2: Get deployer public key ──────────────────────────────────────────
$DEPLOYER_PUBLIC = stellar keys address deployer
Write-Host "      Deployer Public Key: $DEPLOYER_PUBLIC" -ForegroundColor Green

# ── STEP 3: Fund deployer via Friendbot ──────────────────────────────────────
Write-Host ""
Write-Host "[2/6] Funding deployer account via Friendbot..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "https://friendbot.stellar.org?addr=$DEPLOYER_PUBLIC" -UseBasicParsing | Out-Null
    Write-Host "      Funded! Check: https://stellar.expert/explorer/testnet/account/$DEPLOYER_PUBLIC" -ForegroundColor Green
} catch {
    Write-Host "      (Friendbot failed — account may already be funded)" -ForegroundColor DarkYellow
}

# ── STEP 4: Build contracts to WASM ──────────────────────────────────────────
Write-Host ""
Write-Host "[3/6] Building Soroban contracts to WASM..." -ForegroundColor Yellow
Set-Location $ROOT
cargo build --target wasm32-unknown-unknown --release --manifest-path Cargo.toml
if ($LASTEXITCODE -ne 0) { Write-Error "Cargo build failed!"; exit 1 }
Write-Host "      Build successful." -ForegroundColor Green

$SUB_WASM  = Join-Path $ROOT "target\wasm32-unknown-unknown\release\subscriptx_subscription.wasm"
$TREAS_WASM = Join-Path $ROOT "target\wasm32-unknown-unknown\release\subscriptx_treasury.wasm"

# ── STEP 5: Deploy Subscription Contract ─────────────────────────────────────
Write-Host ""
Write-Host "[4/6] Deploying Subscription Contract..." -ForegroundColor Yellow
$SUB_ID = stellar contract deploy `
    --wasm $SUB_WASM `
    --source deployer `
    --network testnet
if ($LASTEXITCODE -ne 0) { Write-Error "Subscription contract deploy failed!"; exit 1 }
Write-Host "      Subscription Contract ID: $SUB_ID" -ForegroundColor Green

# ── STEP 6: Deploy Treasury Contract ─────────────────────────────────────────
Write-Host ""
Write-Host "[5/6] Deploying Treasury Contract..." -ForegroundColor Yellow
$TREAS_ID = stellar contract deploy `
    --wasm $TREAS_WASM `
    --source deployer `
    --network testnet
if ($LASTEXITCODE -ne 0) { Write-Error "Treasury contract deploy failed!"; exit 1 }
Write-Host "      Treasury Contract ID: $TREAS_ID" -ForegroundColor Green

# ── STEP 7: Initialize Subscription Contract ─────────────────────────────────
Write-Host ""
Write-Host "[6/6] Initializing Subscription Contract (linking Treasury)..." -ForegroundColor Yellow
stellar contract invoke `
    --id $SUB_ID `
    --source deployer `
    --network testnet `
    -- initialize `
    --admin $DEPLOYER_PUBLIC `
    --treasury $TREAS_ID
if ($LASTEXITCODE -ne 0) {
    Write-Host "      (Initialize may already have been called — continuing)" -ForegroundColor DarkYellow
}
Write-Host "      Initialization complete." -ForegroundColor Green

# ── Update .env.local ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Updating .env.local with deployed contract IDs..." -ForegroundColor Cyan

$envContent = @"
# Stellar Network Configuration
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org

# Deployed Soroban Contract Addresses (Stellar Testnet)
NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID=$SUB_ID
NEXT_PUBLIC_TREASURY_CONTRACT_ID=$TREAS_ID
"@

Set-Content -Path $ENV_FILE -Value $envContent -Encoding UTF8

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Subscription Contract : $SUB_ID"
Write-Host "  Treasury Contract     : $TREAS_ID"
Write-Host ""
Write-Host "  .env.local has been updated automatically."
Write-Host "  Restart your dev server: npm run dev"
Write-Host ""
Write-Host "  Explorer links:"
Write-Host "  https://stellar.expert/explorer/testnet/contract/$SUB_ID"
Write-Host "  https://stellar.expert/explorer/testnet/contract/$TREAS_ID"
Write-Host ""
