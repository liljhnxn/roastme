# 🔥 RoastMe — On-Chain Feedback & Rating Platform

RoastMe is a modern, lightweight Web3 application deployed on **Botchain Testnet**. It enables users to create on-chain profiles, share their unique links, and collect 1–5 star ratings and honest reviews directly on the blockchain.

---

## 🚀 Features

* **MetaMask Wallet Integration**: Smooth connection, shortened address display, network validation, and automated network switching to Botchain Testnet.
* **On-Chain Profiles**:
  * Create handle and short bio (up to 120 characters).
  * Profile ID mapped directly to the wallet address.
  * Profile updates with ownership verification.
  * Real-time character counters and input validations.
* **Feedback & Rating Submissions**:
  * 1–5 star rating with interactive selector.
  * Unfiltered feedback messages (up to 280 characters).
  * Sender address and block timestamp permanently stored on-chain.
  * Smart contract enforcement: users cannot rate their own profile; one feedback per wallet per profile prevents spam.
* **Feedback Dashboard & Controls**:
  * View average rating (scaled calculation) and total reviews count.
  * Profile owners can enable or pause feedback submissions at any time.
  * Feedback history cards with on-chain verification tags and explorer links.
* **Social Sharing**:
  * Instant copy link for `/profile/0x...`.
  * Browser native sharing API support (`navigator.share`).
  * Community directory to discover other profiles on Botchain.
* **Privacy & Content Safety**:
  * Transparent warnings explaining that blockchain data is public and immutable.
  * Safe design without passwords, emails, or private messages.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
* **Web3 Integration**: wagmi v2, viem v2, @tanstack/react-query
* **Smart Contract**: Solidity 0.8.20, Hardhat, ethers.js v6, TypeChain
* **Network**: Botchain Testnet (Chain ID `968`, Currency `BOHR`)

---

## 🌐 Network Configuration (Botchain Testnet)

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Explorer** | `https://scan.bohr.life` |
| **Currency Symbol** | `BOHR` |

---

## 📦 Getting Started

### 1. Prerequisites

* Node.js 18+ (tested on Node 20 / 25)
* npm or pnpm
* MetaMask browser extension

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Fill in the following variables:

```env
# Smart Contract Deployment (Hardhat)
BOTCHAIN_RPC_URL=https://rpc.bohr.life
PRIVATE_KEY=your_private_key_here

# Frontend Configuration (Next.js)
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.bohr.life
NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=968
NEXT_PUBLIC_BOTCHAIN_EXPLORER=https://scan.bohr.life
```

---

## 🧪 Smart Contract Testing

Run the Hardhat test suite:

```bash
npm run test
```

All 18 comprehensive tests verify:
* Profile creation & duplicate prevention
* Length restrictions on names and bios
* Profile updates and permission checks
* Feedback submission, rating validations (1-5 stars)
* Self-rating prevention & duplicate rating prevention
* Feedback pausing / toggle controls
* Average rating math and profile directories

---

## 🚀 Smart Contract Deployment

Compile the contract:

```bash
npm run compile
```

Deploy `RoastMe.sol` to Botchain Testnet:

```bash
npm run deploy
```

The deployment script automatically:
1. Deploys `RoastMe.sol` to Botchain Testnet (`chainId: 968`).
2. Prints the deployed contract address.
3. Exports the contract address and ABI to `src/contracts/deployedContract.json` and updates the ABI.

Copy the resulting address into your `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`.

---

## 💻 Running the Frontend

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:

```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy Notice

* All submissions (star ratings and review text) are submitted directly to the smart contract on the blockchain.
* Feedback cannot be edited or deleted once confirmed on-chain.
* Never share private keys, seed phrases, or personally identifying private information.

