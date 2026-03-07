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

  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "SimpleVault.sol",
    "SimpleVault.json",
  );

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode as `0x${string}`;

  const rpcUrl = "https://mainnet.base.org";
  const transport = http(rpcUrl);

  const publicClient = createPublicClient({ chain: base, transport });
  const walletClient = createWalletClient({ chain: base, transport, account });

  console.log("Deploying SimpleVault to Base MAINNET from:", account.address);

  // Constructor: owner address (set to your deployer)
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [account.address],
  });

  console.log("Deployment tx hash:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ SimpleVault MAINNET deployed at:", receipt.contractAddress);
  console.log("Confirmed in block:", receipt.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});