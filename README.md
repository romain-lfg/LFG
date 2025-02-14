# LFG Bounty Marketplace 🏋️‍♀️

<div align="center">
  <img src="./docs/static/img/lfg_banner.jpg" alt="Eliza Banner" width="100%" />
</div>

<div align="left">

## 🚩 Overview

- 🕵️‍♀️ Nexus represents devs on the job marketplace, offloading relationship and matchmaking to AI
- 🧠 Safe smart wallet deployed with dev as owner and NexusAgent as executor
- 🛠️ Smart Contract for Escrow and managing bounty originators and devs
- 🔗 Stores bounty and user metadata in Nillion
- 👥 Signed git hash signature recovery for job completion proof of work
- 📦 Contract deployed on Arbitrum Sepolia at https://sepolia.arbiscan.io/address/0xCabaC2ACD4f89e48ce9F31eE0af437Bd45b064ba
- 🍦 Contract deployed on Gelato ABC testnet at https://explorer.abc.t.raas.gelato.cloud/address/0x8db664cfE7A51302CA03895418B42D3ABd565ECa?tab=read_write_contract
- ❄️ Contract deployed on Avalanche Fuji testnet at https://subnets-test.avax.network/c-chain/address/0xCabaC2ACD4f89e48ce9F31eE0af437Bd45b064ba?tab=code&contractTab=read
- 💬 Telegram bot deployed at https://t.me/NexusAgent_Bot
- 📊 Frontend deployed at https://lfg-platform.vercel.app/
- 🐬 Agent hosted on GCP
- 🏝️ Venice AI API for model inference

## 📁 Project Structure

### Core Components

#### Agent System (ElizaOS)
- `agent/` - Main AI agent runtime
- `client/` - Chatbot client interface
- `characters/`
  - `nexus.character.json` - Agent personality and plugin configuration
- model - Venice AI via staked VVV/VCU token

#### Packages
- `plugin-vsa-contracts/` - Agent interaction layer
  - **Actions/**
    - `createUserProfileAction.ts` - User profile creation and Safe smart wallet deployment
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
git clone https://github.com/romain-lfg/LFG
```

#### Edit the .env file

Copy .env.example to .env and fill in the appropriate values.

```
cp .env.example .env
```

Add the following to the .env file:
```
VENICE_API_KEY=         # generate from venice settings https://venice.ai/settings/api

VSA_CONTRACTS_ETHEREUM_WS_URL=    # WebSocket URL for Ethereum node connection (alchemy or infura)
VSA_CONTRACTS_EVM_PROVIDER_URL=   # RPC URL for Ethereum node connection (if WS not available)
VSA_CONTRACTS_EVM_PRIVATE_KEY=    # Private key for the wallet executing arbitrage transactions (generate new private key and fund with testnet coin)
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
