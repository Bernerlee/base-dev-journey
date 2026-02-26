import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { CONFIG } from "./config.js";

export const chain = CONFIG.chain === "mainnet" ? base : baseSepolia;

export const rpcUrl =
  CONFIG.chain === "mainnet"
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
