# StellarGive

StellarGive is a decentralized donation transparency platform built on the Stellar blockchain. It enables charities to create fundraising campaigns, accept donations in XLM or Stellar tokens, and allows donors to track all transactions and fund usage transparently on-chain.

---

## Overview

StellarGive is designed to bring transparency, accountability, and trust to charitable donations. By leveraging blockchain technology, every donation is recorded on-chain, making it verifiable and tamper-proof.

---

## Features

- Campaign creation and management for charities  
- Transparent on-chain donation tracking  
- Support for XLM and Stellar tokens  
- Wallet connection via Freighter  
- Real-time transaction verification  
- Campaign updates and reporting  
- Donor and charity dashboards  
- Search and discovery of campaigns  

---

## Tech Stack

- Blockchain: Stellar  
- API Layer: Horizon  
- Wallet: Freighter  
- Frontend: React / Next.js  
- Backend: Node.js  

---

## System Architecture

---

## Core Concepts

- **Campaign**: A fundraising initiative with a goal and wallet address  
- **Charity**: Organization managing campaigns  
- **Donor**: User contributing funds  
- **Donation**: On-chain payment (XLM or token)  
- **Transaction**: Ledger record of fund movement  
- **Wallet**: Stellar account identified by a public key  

---

## Functional Requirements

### Campaign Creation
Charities can create fundraising campaigns with title, description, goal, and wallet address.  
- Validates wallet address and funding goal  
- Assigns unique campaign ID  
- Stores campaign data persistently  

---

### Campaign Updates
Charities can post updates to report fund usage.  
- Updates are timestamped  
- Multiple updates supported  
- Displayed in reverse chronological order  

---

### Wallet Connection
Donors connect their wallets using Freighter.  
- Retrieves public key and balance  
- Prompts installation if not available  
- Supports disconnect functionality  

---

### Donation System
Donors can send XLM or Stellar tokens.  
- Builds and signs transactions via Freighter  
- Submits transactions to Horizon  
- Stores transaction details  
- Validates balance and input  

---

### Transaction Tracking
All donations are publicly verifiable.  
- Fetches transactions from Horizon  
- Displays donor, amount, asset, and timestamp  
- Supports pagination  
- Fallback to local data if needed  

---

### Campaign Discovery
Users can browse and search campaigns.  
- View all active campaigns  
- Filter by title and description  
- Displays funding progress  

---

### Donor Dashboard
Donors can view their contributions.  
- Shows donation history  
- Displays total contributions  
- Fetches data using wallet public key  

---

### Charity Dashboard
Charities manage campaigns and track donations.  
- View campaigns linked to wallet  
- Monitor funds raised  
- Post updates  

---

### Transaction Verification
Users can verify donations using transaction hash.  
- Queries Horizon  
- Confirms recipient wallet  
- Displays transaction details  

---

### Environment Configuration

- Uses environment variables for configuration  
- Supports Testnet and Mainnet  
- Includes `.env.example`  
- Prevents startup if variables are missing  

---

## Getting Started

### Prerequisites

- Node.js  
- Stellar SDK  
- Freighter Wallet  

### Installation

```bash
git clone https://github.com/your-username/stellargive.git
cd stellargive
npm install
npm run dev
