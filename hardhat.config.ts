import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-viem";
import "dotenv/config";

export default defineConfig({
  solidity: "0.8.28",
  networks: {
    baseSepolia: {
      type: "http",
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
});
