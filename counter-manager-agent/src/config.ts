import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env`);
  return v;
}

export const CONFIG = {
  privateKey: required("PRIVATE_KEY") as `0x${string}`,
  counterAddress: required("COUNTER_ADDRESS") as `0x${string}`,
  discordWebhookUrl: (process.env.DISCORD_WEBHOOK_URL || "").trim(),

  // Agent policy parameters (tune these)
  minX: 20n,
  maxX: 50n,
  step: 5n,

  // Safety rails
  maxTxPerDay: 10,
  loopSeconds: 300, // 5 minutes
};
