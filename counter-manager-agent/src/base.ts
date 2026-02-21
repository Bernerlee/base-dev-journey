import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, base } from "viem/chains";
import { CONFIG } from "./config.js";

// 🔹 Choose chain dynamically
export const chain = CONFIG.isMainnet ? base : baseSepolia;

// 🔹 Choose RPC dynamically
export const rpcUrl = CONFIG.isMainnet
  ? "https://mainnet.base.org"
  : "https://sepolia.base.org";

export const account = privateKeyToAccount(CONFIG.privateKey);

export const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

export const walletClient = createWalletClient({
  account,
  chain,
  transport: http(rpcUrl),
});
