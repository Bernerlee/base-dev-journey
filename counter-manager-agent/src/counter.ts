import CounterAbi from "./abi/CounterV2.json" with { type: "json" };
import { publicClient, walletClient } from "./base.js";
import { CONFIG } from "./config.js";
import { encodeFunctionData } from "viem";

export const counter = {
  address: CONFIG.counterAddress,
  abi: CounterAbi as any,
};

/**
 * Append Builder Code (ERC-8021 suffix)
 * Builder code: bc_o1eooot7
 * Hex suffix: 62635f6f31656f6f6f7437
 */
function withBuilderCode(data: `0x${string}`): `0x${string}` {
  const builderSuffix = "62635f6f31656f6f6f7437"; // bc_o1eooot7
  return (data + builderSuffix) as `0x${string}`;
}

export async function readX(): Promise<bigint> {
  const x = await publicClient.readContract({
    address: counter.address,
    abi: counter.abi,
    functionName: "x",
  });
  return BigInt(x as any);
}

export async function incBy(v: bigint): Promise<`0x${string}`> {
  const data = encodeFunctionData({
    abi: counter.abi,
    functionName: "incBy",
    args: [v],
  });

  return walletClient.sendTransaction({
    to: counter.address,
    data: withBuilderCode(data),
  });
}

export async function reset(): Promise<`0x${string}`> {
  const data = encodeFunctionData({
    abi: counter.abi,
    functionName: "reset",
    args: [],
  });

  return walletClient.sendTransaction({
    to: counter.address,
    data: withBuilderCode(data),
  });
}
