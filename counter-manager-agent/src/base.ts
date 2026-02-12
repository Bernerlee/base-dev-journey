import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { CONFIG } from "./config.js";

export const chain = baseSepolia;
export const rpcUrl = "https://sepolia.base.org";

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
