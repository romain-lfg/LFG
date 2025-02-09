# LFG Bounty Marketplace 🏋️‍♀️

<div align="center">
  <img src="./docs/static/img/lfg.jpg" alt="Eliza Banner" width="100%" />
</div>

<div align="left">

## 🚩 Overview

- 🛠️ Smart Contract for Escrow and managing bounty originators and devs
- 🔗 Stores data about users in Nillion
- 👥 Signed git hash signature recovery for job completion proof of work
- 📦 Deployed on Arbitrum Sepolia at https://sepolia.arbiscan.io/address/0xcabac2acd4f89e48ce9f31ee0af437bd45b064ba

## 📁 Project Structure

### Core Components

#### Agent System (ElizaOS)
- `agent/` - Main AI agent runtime
- `client/` - Chatbot client interface
- `characters/`
  - `nexus.character.json` - Agent personality and plugin configuration

#### Packages
- `plugin-vsa-contracts/` - Smart contract interaction layer
  - **Actions/**
    - `createUserProfileAction.ts` - User profile creation
    - `createBountyAction.ts` - Bounty creation
    - `acceptJobAction.ts` - Bounty acceptance
    - `completeJobAction.ts` - Bounty completion with git hash signed for proof of work
    - `releasePaymentAction.ts` - Escrow fund release to dev
    - `submitRatingAction.ts` - Rating submission for dev and employer
    - `getUserReputationAction.ts` - Get user reputation
    - `getJobDetailsAction.ts` - Get bounty details
    - `initiateDisputeAction.ts` - Dispute initiation if dev underperforms
    - `matchBountiesAction.ts` - Skill-based bounty matching
  - **In Development:**
    - Improved arbitration
    - Payment from user to agent

#### Data Storage
- `nillion/` - Decentralized data management
  - `src/`
    - `index.js` - Core data operations (CRUD, matching)

#### Frontend
- `frontend/` - Web interface for bounty marketplace

#### Smart Contracts
- `contracts/contract/` - Solidity smart contracts
  - `BountyMarketplace.sol` - Main marketplace contract
  - `Escrow.sol` - Handles secure payment flows
  - `Reputation.sol` - User reputation management
- `contracts/test/` - Contract test suite
  - Unit tests for marketplace functionality
  - Integration tests for complete workflows
  - Coverage reports for contract security

## 🔄 User Flows

### Developer Flow
1. **Profile Creation**
   - Submit profile data via agent
   - Data stored in Nillion
   - Profile registered on smart contract

2. **Bounty Discovery**
   - Request matching bounties
   - Skill-based matching via Nillion
   - View matched bounties with IDs

3. **Bounty Acceptance**
   - Accept using bounty ID
   - Wallet address linked to escrow

4. **Completion**
   - Mark bounty as complete
   - Await payment release

### Bounty Creator Flow
1. **Bounty Creation**
   - Submit bounty details
   - Data stored in Nillion
   - Smart contract created with funds

2. **Post-Completion**
   - Release funds to developer
   - **Option A:** Submit rating
   - **Option B:** Initiate dispute

### Dispute Resolution
1. **Dispute Process**
   - Creator initiates dispute
   - Owner arbitrates
   - Winner receives:
     - Escrowed funds
     - Reputation bonus



### Start Nexus AI Agent

```bash
# Clone the repository
git clone https://github.com/Okulon/LFG.git
```

#### Edit the .env file

Copy .env.example to .env and fill in the appropriate values.

```
cp .env.example .env
```

Add the following to the .env file:
```
OPENAI_API_KEY=         # OpenAI API key, starting with sk-

VSA_CONTRACTS_ETHEREUM_WS_URL=                  # WebSocket URL for Ethereum node connection
VSA_CONTRACTS_EVM_PROVIDER_URL=                 # RPC URL for Ethereum node connection (if WS not available)
VSA_CONTRACTS_EVM_PRIVATE_KEY=                  # Private key for the wallet executing arbitrage transactions
```

Make sure to fund your agent's wallet with some Arbitrum SepoliaETH

#### Start Nexus AI Agent

```bash
pnpm i
pnpm build
pnpm start --"character=characters/nexus.character.json"
```

### Interact via Browser

Once the agent is running, you should see the message to run "pnpm start:client" at the end.

Open another terminal, move to the same directory, run the command below, then follow the URL to chat with your agent.

```bash
pnpm start:client
```



---

#### Additional Requirements

You may need to install Sharp. If you see an error when starting up, try installing it with the following command:

```
pnpm install --include=optional sharp
```