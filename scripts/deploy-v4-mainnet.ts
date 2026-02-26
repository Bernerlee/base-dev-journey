import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env`);
  return v;
}

async function main() {
  const privateKey = mustEnv("PRIVATE_KEY");
  if (!privateKey.startsWith("0x")) {
    throw new Error("PRIVATE_KEY must start with 0x");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // Make sure CounterV4 is compiled already
  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "CounterV4.sol",
    "CounterV4.json",
  );

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode as `0x${string}`;

  const transport = http("https://mainnet.base.org");

  const publicClient = createPublicClient({
    chain: base,
    transport,
  });

  const walletClient = createWalletClient({
    chain: base,
    transport,
    account,
  });

  console.log("Deploying to Base MAINNET from:", account.address);

  // Constructor args: (minX, maxX, step)
  const minX = 10n;
  const maxX = 50n;
  const step = 7n;

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [minX, maxX, step],
  });

  console.log("Deployment tx hash:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  console.log("✅ CounterV4 MAINNET deployed at:", receipt.contractAddress);
  console.log("Confirmed in block:", receipt.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
