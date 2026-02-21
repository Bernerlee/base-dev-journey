import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env`);
  return v;
}

// Network mode (default: sepolia)
const chain = (process.env.CHAIN || "sepolia").toLowerCase();
const isMainnet = chain === "mainnet";

export const CONFIG = {
  // --- Core ---
  privateKey: required("PRIVATE_KEY") as `0x${string}`,
  counterAddress: required("COUNTER_ADDRESS") as `0x${string}`,
  discordWebhookUrl: (process.env.DISCORD_WEBHOOK_URL || "").trim(),

  chain,
  isMainnet,

  // --- Policy (kept for fallback / logging, but you’re now reading policy from chain) ---
  minX: 20n,
  maxX: 50n,
  step: 5n,

  // --- Safety rails ---
  maxTxPerDay: isMainnet ? 5 : 20,
  loopSeconds: isMainnet ? 600 : 300, // slower on mainnet
  resetCooldownSeconds: isMainnet ? 900 : 120, // 15 mins mainnet, 2 mins testnet

  // --- Execution mode ---
  dryRun: (process.env.DRY_RUN || "false").toLowerCase() === "true",
};
