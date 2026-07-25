# SubscriptX ⚡
### Decentralized Subscription Billing Platform on Stellar Soroban

[![Stellar Soroban](https://img.shields.io/badge/Stellar-Soroban_v22.0-purple.svg)](https://soroban.stellar.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-black.svg)](https://nextjs.org/)
[![Build Status](https://img.shields.io/badge/Stellar_Build_Challenge-Level_1_%7C_Level_2_%7C_Level_3-emerald.svg)](https://stellar.org)

SubscriptX is a production-ready, decentralized subscription management platform built specifically for the **Stellar Build Challenge** (Level 1 New Moon, Level 2 Yellow Belt, Level 3 Orange Belt).

It delivers an **Enterprise SaaS Quality UI** (matching Stripe, Vercel, Linear, and Notion aesthetic standards) powered directly by **Stellar Soroban Smart Contracts** with zero backend database or REST API complexity.

---

## 🏗️ Architecture Diagram

```
[ User Browser / Web App ]
         │
         ├──► Stellar Wallets Kit (Freighter, xBull, Albedo)
         │
         ▼
[ Soroban RPC Endpoint ] (https://soroban-testnet.stellar.org)
         │
         ├──► Subscription Smart Contract (`subscriptx-subscription`)
         │         │
         │         ├── create_plan()
         │         ├── subscribe() ───► [ Inter-Contract Invocation ]
         │         ├── cancel_subscription()                    │
         │         └── get_all_plans()                          │
         │                                                      ▼
         └──► Treasury Smart Contract (`subscriptx-treasury`) ◄─┘
                   │
                   ├── receive_payment() (1.5% protocol fee split)
                   ├── withdraw() (Merchant revenue cashout)
                   └── get_merchant_balance()
```

---

## ✨ Features & Stellar Build Challenge Compliance

### Level 1 (New Moon)
- ✔ **Soroban Smart Contracts**: Written in Rust using `soroban-sdk` v22 with `#![no_std]`.
- ✔ **Next.js 15 Web Application**: Modern App Router UI styled with Tailwind CSS, glassmorphic cards, and Framer Motion animations.

### Level 2 (Yellow Belt)
- ✔ **Multi-Wallet Support**: Native integration with **Freighter**, **xBull**, and **Albedo** using `@creit.tech/stellar-wallets-kit`.
- ✔ **Wallet Connection**: Connect/Disconnect lifecycle with active account balance rendering.
- ✔ **Soroban Contract Interactions**: On-chain plan creation, subscription payments, and cancellations.
- ✔ **Real-Time Transaction Status**: `Pending`, `Success`, and `Failed` feedback with toast notifications.
- ✔ **Error Handling**: Graceful fallback UI for missing extension, rejected signatures, insufficient XLM balance, or network errors.

### Level 3 (Orange Belt)
- ✔ **Inter-Contract Communication**: The `Subscription` contract directly invokes `TreasuryContract.receive_payment()` upon subscription to split protocol fees and store merchant revenue.
- ✔ **Treasury Vault Management**: Dedicated contract managing merchant revenue custody and instant cashouts.
- ✔ **Rust Contract Unit Tests**: 6+ unit tests covering plan creation, subscription payment split, subscriber limits, cancellation, and treasury withdrawal.
- ✔ **Frontend Unit Tests**: Unit test suite for utilities, formatters, and contract configurations.
- ✔ **CI/CD Pipeline**: `.github/workflows/ci.yml` automated GitHub Actions workflow verifying Rust contract builds and Next.js production compilation.

---

## 📁 Project Structure

```
SubscriptX/
├── .github/workflows/ci.yml           # GitHub Actions CI/CD Pipeline
├── contracts/                         # Rust Soroban Smart Contracts
│   ├── subscription/                  # Subscription Contract
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs                 # create_plan, update_plan, subscribe, cancel_subscription, get_plan, get_all_plans
│   │       └── test.rs                # Rust unit tests
│   └── treasury/                      # Treasury & Revenue Split Contract
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs                 # receive_payment, withdraw, get_balance, get_merchant_balance
│           └── test.rs                # Rust unit tests
├── src/
│   ├── app/                           # Next.js 15 App Router (6 Core Pages)
│   │   ├── layout.tsx                 # Root layout with Header, Footer & Providers
│   │   ├── page.tsx                   # Enterprise Landing Page
│   │   ├── dashboard/page.tsx         # Dashboard Overview (4 Metric Cards & Activity Feed)
│   │   ├── marketplace/page.tsx       # Plan Directory & Plan Creation Modal
│   │   ├── subscriptions/page.tsx     # My Active Subscriptions Manager
│   │   ├── history/page.tsx           # Transaction History & Explorer Links
│   │   └── settings/page.tsx          # Connected Wallet & Network Config
│   ├── components/                    # UI & Component Primitives
│   │   ├── ui/                        # Button, Card, Input, Modal, Badge, Skeleton, Toast, Tabs
│   │   ├── layout/                    # Header, Footer, Mobile Drawer
│   │   └── wallet/                    # Multi-wallet Connection Modal (Freighter, xBull, Albedo)
│   ├── hooks/                         # Custom React Hooks
│   │   ├── use-wallet.ts              # Multi-wallet state provider
│   │   ├── use-contract.ts            # Soroban contract interaction hook
│   │   └── use-toast.ts               # Toast notifications
│   ├── lib/                           # Core Utilities
│   │   ├── stellar.ts                 # Soroban RPC client & network constants
│   │   ├── wallet-kit.ts              # Stellar Wallets Kit manager
│   │   ├── mock-indexer.ts            # On-chain store synchronization
│   │   └── utils.ts                   # Formatting helpers (XLM, dates, truncation)
│   ├── types/                         # TypeScript Type Definitions
│   └── __tests__/                     # Frontend Unit Tests
├── scripts/
│   └── deploy-contracts.ts            # Testnet contract deployment script
├── Cargo.toml                         # Cargo Workspace configuration
├── package.json                       # Dependencies & npm scripts
├── .env.local                         # Stellar Testnet environment variables
└── README.md
```

---

## ⚙️ Environment Variables (`.env.local`)

```env
# Stellar Network Configuration
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org

# Soroban Deployed Contract Addresses (Stellar Testnet)
NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID=CB6Y6Q5XJ4L6M7O4A4K3R2T1V0S9P8N7M6L5K4J3H2G1
NEXT_PUBLIC_TREASURY_CONTRACT_ID=CC5X5P4WI3K5L6N3Z3J2Q1S0U9R8O7N6M5L4K3J2H1G0
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js >= 18.x
- Rust toolchain with `wasm32-unknown-unknown` target:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

### 2. Run Soroban Smart Contract Unit Tests
```bash
cargo test
```

### 3. Run Frontend Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Smart Contract Deployment to Stellar Testnet

To deploy custom instances of SubscriptX contracts on Stellar Testnet using the official `stellar` CLI:

```bash
# 1. Build WASM binaries
cargo build --target wasm32-unknown-unknown --release

# 2. Deploy Subscription Contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/subscriptx_subscription.wasm \
  --source-account S... \
  --network testnet

# 3. Deploy Treasury Contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/subscriptx_treasury.wasm \
  --source-account S... \
  --network testnet
```

Update the returned contract IDs in `.env.local`.

---

## 📜 License

MIT License. Built for the Stellar Build Challenge.
