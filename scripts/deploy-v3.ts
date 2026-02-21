import { network } from "hardhat";

async function main() {
  const conn: any = await network.connect();

  console.log("connect() keys:", Object.keys(conn));
  console.log("viem keys:", conn.viem ? Object.keys(conn.viem) : "undefined");

  if (!conn.viem) {
    throw new Error(
      "conn.viem is undefined. Make sure @nomicfoundation/hardhat-viem is installed and imported in hardhat.config.ts",
    );
  }

  const viem = conn.viem;

  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying with:", deployer.account.address);

  const minX = 10n;
  const maxX = 50n;
  const step = 7n;

  const contract = await viem.deployContract("CounterV3", [minX, maxX, step]);

  console.log("CounterV3 deployed to:", contract.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
