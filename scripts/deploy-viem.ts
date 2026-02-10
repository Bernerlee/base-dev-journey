import "dotenv/config";
import fs from "fs";
import path from "path";
import solc from "solc";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

function compileContract() {
  const contractPath = path.join(process.cwd(), "contracts", "CounterV2.sol");

  const source = fs.readFileSync(contractPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "CounterV2.sol": { content: source },
    },
    settings: {
      optimizer: { enabled: false, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  // Debug: show compile errors and what solc produced
  if (output.errors?.length) {
    console.log("SOLC messages:");
    for (const e of output.errors) {
      console.log(`${e.severity}: ${e.formattedMessage}`);
    }
  }

  console.log("Compiled source keys:", Object.keys(output.contracts || {}));

  const fileKey = "CounterV2.sol";
  const contractsForFile = output.contracts?.[fileKey];

  if (!contractsForFile) {
    throw new Error(
      `solc did not output contracts for "${fileKey}". Make sure contracts/CounterV2.sol exists and compiles.`,
    );
  }

  const contractName = Object.keys(contractsForFile)[0];
  const contract = contractsForFile[contractName];

  return {
    abi: contract.abi,
    bytecode: `0x${contract.evm.bytecode.object}` as `0x${string}`,
    contractName,
  };
}

async function main() {
  const pk = process.env.PRIVATE_KEY as string | undefined;
  if (!pk || !pk.startsWith("0x")) {
    throw new Error("Missing PRIVATE_KEY in .env (must start with 0x)");
  }

  const { abi, bytecode, contractName } = compileContract();

  const account = privateKeyToAccount(pk as `0x${string}`);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  console.log("Deploying:", contractName);
  console.log("Deployer:", account.address);

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [],
  });

  console.log("Deploy tx:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Contract deployed at:", receipt.contractAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
