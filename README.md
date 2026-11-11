# 🔥 RoastMe — On-Chain Feedback & Rating Platform

RoastMe is a modern, lightweight Web3 application deployed on **Botchain Mainnet** (and Botchain Testnet). It enables users to create on-chain profiles, share their unique links, and collect 1–5 star ratings and honest reviews directly on the blockchain.

---

## 🌐 Network Configuration

### Botchain Mainnet
| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Mainnet |
| **Chain ID** | `677` |
| **RPC URL** | `https://rpc.botchain.ai` |
| **Explorer** | `https://scan.botchain.ai` |
| **Native Token** | `BOT` |
| **Deployed Contract** | [`0x2D08644ebAD640aAb1eB77148a540e47741F9738`](https://scan.botchain.ai/address/0x2D08644ebAD640aAb1eB77148a540e47741F9738#code) (Verified) |

### Botchain Testnet
| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Explorer** | `https://scan.bohr.life` |
| **Currency** | `BOHR` |
| **Deployed Contract** | [`0x350091F9Dc2C19a9e53cf702bD620B601d61C674`](https://scan.bohr.life/address/0x350091F9Dc2C19a9e53cf702bD620B601d61C674#code) (Verified) |
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

