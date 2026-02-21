import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

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

  // Read Hardhat artifact (make sure you compiled first)
  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "CounterV3.sol",
    "CounterV3.json",
  );

  const artifactRaw = fs.readFileSync(artifactPath, "utf8");
  const artifact = JSON.parse(artifactRaw);

  const abi = artifact.abi;
  const bytecode = artifact.bytecode as `0x${string}`;

  const transport = http("https://sepolia.base.org");

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport,
  });

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport,
    account,
  });

  console.log("Deploying from:", account.address);

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

  console.log("✅ CounterV3 deployed at:", receipt.contractAddress);
  console.log("Confirmed in block:", receipt.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
