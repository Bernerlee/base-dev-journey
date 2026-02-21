import CounterAbi from "./abi/CounterV4.json" with { type: "json" };
import { publicClient, walletClient } from "./base.js";
import { CONFIG } from "./config.js";

const BUILDER_CODE = "bc_o1eooot7";

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

export async function readMinX(): Promise<bigint> {
  const v = await publicClient.readContract({
    address: counter.address,
    abi: counter.abi,
    functionName: "minX",
  });
  return BigInt(v as any);
}

export async function readMaxX(): Promise<bigint> {
  const v = await publicClient.readContract({
    address: counter.address,
    abi: counter.abi,
    functionName: "maxX",
  });
  return BigInt(v as any);
}

export async function readStep(): Promise<bigint> {
  const v = await publicClient.readContract({
    address: counter.address,
    abi: counter.abi,
    functionName: "step",
  });
  return BigInt(v as any);
}

// CounterV4: incBy(uint256 value, string builderCode)
export async function incBy(v: bigint): Promise<`0x${string}`> {
  return walletClient.writeContract({
    address: counter.address,
    abi: counter.abi,
    functionName: "incBy",
    args: [v, BUILDER_CODE],
  });
}

// CounterV4: reset(string builderCode)
export async function reset(): Promise<`0x${string}`> {
  return walletClient.writeContract({
    address: counter.address,
    abi: counter.abi,
    functionName: "reset",
    args: [BUILDER_CODE],
  });
}
