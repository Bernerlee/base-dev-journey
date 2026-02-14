# Base Counter Agent

Autonomous smart contract management system built on Base.

This project deploys and manages an onchain counter contract using a policy-driven automation agent. All agent transactions are attributed using Base Builder Code (ERC-8021).

---

## 🔗 Deployed Contracts (Base Sepolia)

### Counter V1

0x4aa1c02a9a0fbe75b2b7369c809df974b3e6dfd6

### Counter V2

0xeded7187e4817ce4d5f6d6c29ef54b4b07734adf

---

## 🧠 System Overview

The system consists of:

- Solidity smart contracts deployed on Base Sepolia
- A TypeScript-based autonomous agent
- Policy-driven execution logic
- Human (main wallet) governance interactions
- ERC-8021 Builder Code attribution

The agent reads contract state and executes transactions based on configurable thresholds.

---

## ⚙️ Agent Logic

Default policy:

- Minimum threshold: 10
- Maximum threshold: 50
- Step increment: 7

Behavior:

- If `x < min` → call `incBy(step)`
- If `x > max` → call `reset()`
- Otherwise → no action

---

## 🏷 Builder Code Attribution (ERC-8021)

Builder Code:
bc_o1eooot7

All agent-generated transactions include the ERC-8021 builder suffix for onchain attribution.

Example attributed transaction:
(Replace with one of your real tx links)
https://sepolia.basescan.org/tx/YOUR_TX_HASH

---

## 🔁 Human + Agent Interaction Model

The system supports:

- Manual interaction via Rabby (main wallet)
- Autonomous policy execution via the agent
- Event emissions
- ETH transfers with `receive()` support

This creates a hybrid governance + automation model on Base.

---

## 🛠 Tech Stack

- Solidity
- Hardhat
- Viem
- TypeScript
- Base Sepolia
- ERC-8021 Builder Codes

---

## 🚀 Running the Agent

Navigate to:
