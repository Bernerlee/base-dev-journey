import CounterAbi from "./abi/CounterV2.json" with { type: "json" };
import { publicClient, walletClient } from "./base.js";
import { CONFIG } from "./config.js";

export const counter = {
  address: CONFIG.counterAddress,
  abi: CounterAbi as any,
};

export async function readX(): Promise<bigint> {
  const x = await publicClient.readContract({
    address: counter.address,
    abi: counter.abi,
    functionName: "x",
  });
  return BigInt(x as any);
}

export async function incBy(v: bigint): Promise<`0x${string}`> {
  return walletClient.writeContract({
    address: counter.address,
    abi: counter.abi,
    functionName: "incBy",
    args: [v],
  });
}

export async function reset(): Promise<`0x${string}`> {
  return walletClient.writeContract({
    address: counter.address,
    abi: counter.abi,
    functionName: "reset",
    args: [],
  });
}
