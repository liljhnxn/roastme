# 🔥 RoastMe: Decentralized Reputation & On-Chain Feedback Protocol
### Official Whitepaper & Project Pitch Deck
**Version:** 1.1  
**Mainnet Network:** Botchain Mainnet (Chain ID: `677`)  
**Mainnet Verified Contract:** [`0x2D08644ebAD640aAb1eB77148a540e47741F9738`](https://scan.botchain.ai/address/0x2D08644ebAD640aAb1eB77148a540e47741F9738#code)  
**Testnet Verified Contract:** [`0x350091F9Dc2C19a9e53cf702bD620B601d61C674`](https://scan.bohr.life/address/0x350091F9Dc2C19a9e53cf702bD620B601d61C674#code)  
**Repository:** [https://github.com/liljhnxn/roastme](https://github.com/liljhnxn/roastme)  

---

## 1. Executive Summary

In traditional Web2 platforms (Trustpilot, Yelp, Twitter), user reviews and social feedback are plagued by fake reviews, censorship, paid moderation, and centralized de-platforming. Web3 builders, founders, creators, and freelancers lack a transparent, verifiable mechanism to collect candid feedback and build an authentic, verifiable reputation.

**RoastMe** is a lightweight, high-performance decentralized feedback and rating platform built natively on **Botchain**. It allows anyone to claim an on-chain identity, share a public review link, and receive immutable 1–5 star ratings and feedback stored directly on the blockchain. By enforcing strict smart contract invariants (preventing self-rating, limiting one review per wallet, and calculating fixed-point average ratings on-chain), RoastMe eliminates centralized manipulation and establishes verifiable social proof for the decentralized web.

---

## 2. Problem Statement

1. **Manipulated & Censorsed Reviews in Web2:** Centralized review platforms frequently delete negative reviews for paying corporate sponsors or fail to prevent bot review farms.
2. **Absence of Verifiable Social Proof in Web3:** Web3 projects and builders currently rely on unverified screenshots, easily forged testimonials, or ephemeral Discord messages to prove peer credibility.
3. **No Direct Owner Controls:** Users either have open comment sections overrun by spam or must disable interactions completely without granular pause/resume states.
4. **Data Fragmentation:** Reputation data is trapped within private databases rather than remaining composable on open smart contracts.

---

## 3. The RoastMe Solution

RoastMe transforms peer feedback into permanent on-chain credentials:

* **Authentic On-Chain Reviews:** Star ratings (1–5★) and feedback comments (up to 280 characters) are committed directly to Botchain's distributed ledger.
* **Smart Contract Anti-Sybil & Anti-Spam Guards:**
  * **Self-Rating Prevention:** Wallets cannot rate or roast their own profiles (`CannotRateOwnProfile`).
  * **Single Review Constraint:** A reviewer wallet can only submit one rating per profile, preventing rating spam and artificial score inflation (`FeedbackAlreadySubmitted`).
  * **Owner Gatekeeping:** Profile owners can toggle submission states (`setFeedbackStatus`) at any time to prevent brigade spam during sensitive periods.
* **Transparent Mathematical Aggregation:** Average ratings are calculated on-chain with fixed-point precision (`(sumRatings * 100) / totalFeedback`), eliminating black-box algorithmic bias.
* **Instant Social Sharing:** Every profile possesses a unique, canonical URL (`/profile/0x...`) with native Web Share API and one-click clipboard copying.

---

## 4. Product & Architecture Overview

### 4.1 System Diagram

```
┌────────────────────────────────────────────────────────┐
│                   Web3 Frontend User                   │
│   (Next.js 14 App Router / Wagmi v2 / MetaMask Wallet) │
└───────────────────────────┬────────────────────────────┘
                            │
              JSON-RPC / Viem Interactions
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Botchain Testnet (Chain ID: 968)           │
│  RPC: https://rpc.bohr.life | Explorer: scan.bohr.life │
├────────────────────────────────────────────────────────┤
│                   RoastMe.sol Smart Contract           │
│  - Profile Structs (Name, Bio, Stats, Toggle State)   │
│  - Feedback Structs (Sender, Rating 1-5, Timestamp)   │
│  - Strict Access Controls & Event Emissions           │
│  - On-Chain Mathematical Aggregator                   │
└────────────────────────────────────────────────────────┘
```

### 4.2 Smart Contract Implementation Details

* **Contract File:** `contracts/RoastMe.sol`
* **Solidity Version:** `^0.8.20` (Paris EVM target with optimization enabled)
* **Events Emitted:**
  * `ProfileCreated(address indexed user, string displayName, string bio)`
  * `ProfileUpdated(address indexed user, string displayName, string bio)`
  * `FeedbackSubmitted(address indexed targetUser, address indexed sender, uint8 rating, string message, uint256 timestamp)`
  * `FeedbackStatusChanged(address indexed user, bool enabled)`
* **Test Coverage:** 18 comprehensive Hardhat test cases validating all security boundaries, boundary constraints, and math logic.

---

## 5. Market Opportunity & Target Personas

| Target Persona | Use Case | Value Delivered |
| :--- | :--- | :--- |
| **Web3 Developers & Freelancers** | Audits, smart contract freelancing, code review reputation. | Cryptographically verifiable portfolio reviews from verified clients. |
| **DAO Leaders & Core Contributors** | Governance accountability, community feedback collection. | Uncensored community sentiment metrics recorded transparently. |
| **dApp & Protocol Founders** | Public alpha/beta user feedback and bug roasts. | Genuine user reviews without fake marketing fluff. |
| **KOLs, Alpha Callers & Creators** | Transparent performance rating and prediction accuracy. | An immutable track record of credibility on Botchain. |

---

## 6. Tokenomics & Future Monetization Roadmap

While RoastMe Testnet operates with zero protocol fees to encourage adoption, future mainnet iterations introduce sustainable revenue models:

1. **Micro-Tipping & Paid Priority Roasts:** Optional BOHR tip attached to a roast or rating to boost visibility on top-rated profile feeds.
2. **On-Chain Reputation Soulbound Tokens (SBTs):** Minting verifiable badge NFTs for profiles maintaining a 4.5+ star rating over 50+ unique reviews.
3. **B2B API & Widget Integration:** Embeddable on-chain review widgets for Web3 websites and dApps powered by RoastMe's decentralized data layer.
4. **Botchain AI Agent Feedback:** Allowing autonomous AI agents on Botchain to leave automated code quality and reliability feedback on developer profiles.

---

## 7. Roadmap

### Phase 1: Testnet Launch (Completed ✅)
* [x] Design and compile `RoastMe.sol` with Hardhat.
* [x] Implement comprehensive 18/18 unit test suite.
* [x] Deploy and verify contract on Botchain Testnet (`0x350091F9Dc2C19a9e53cf702bD620B601d61C674`).
* [x] Full Next.js 14 frontend with MetaMask integration, auto-network switching, and real-time validation.
* [x] Public GitHub repository deployment.

### Phase 2: Community & Co-Marketing
* [ ] Ecosystem integration with Botchain official channels and dApp showcase.
* [ ] Community "Roast the Devs" interactive feedback campaign.
* [ ] Open-source widget component for external dApp integration.

### Phase 3: Botchain Mainnet & Reputation Layer
* [ ] Audit and deploy production smart contract to Botchain Mainnet.
* [ ] Reputation scoring algorithm weighing reviewer wallet age and activity.
* [ ] Soulbound Reputation Token (SBT) minting for verified builders.

---

## 8. Verification & Project References

* **Botchain Testnet RPC:** `https://rpc.bohr.life`
* **Botchain Explorer Contract Code:** [BOHR Scan Contract 0x3500...C674](https://scan.bohr.life/address/0x350091F9Dc2C19a9e53cf702bD620B601d61C674#code)
* **GitHub Repository:** [https://github.com/liljhnxn/roastme](https://github.com/liljhnxn/roastme)
* **License:** MIT Open Source

