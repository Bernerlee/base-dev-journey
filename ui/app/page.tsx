"use client";

import { base } from "wagmi/chains";
import { useChainId, useSwitchChain } from "wagmi";
import ActivityFeed from "./components/ActivityFeed";

import toast from "react-hot-toast";
import { useEffect } from "react";

import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { BUILDER_CODE, COUNTER_ABI, COUNTER_ADDRESS } from "@/lib/counter";

export default function Home() {
  const chainId = useChainId();
  const isBaseMainnet = chainId === base.id;

  const { switchChain, isPending: switching } = useSwitchChain();
  const [incValue, setIncValue] = useState<number>(7);

  const xRead = useReadContract({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    functionName: "x",
  });

  const minRead = useReadContract({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    functionName: "minX",
  });

  const maxRead = useReadContract({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    functionName: "maxX",
  });

  const stepRead = useReadContract({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    functionName: "step",
  });

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const refetchAll = () => {
    xRead.refetch();
    minRead.refetch();
    maxRead.refetch();
    stepRead.refetch();
  };

  if (isSuccess) refetchAll();

  const incBy = () =>
    writeContract({
      address: COUNTER_ADDRESS,
      abi: COUNTER_ABI,
      functionName: "incBy",
      args: [BigInt(incValue), BUILDER_CODE],
    });

  const reset = () =>
    writeContract({
      address: COUNTER_ADDRESS,
      abi: COUNTER_ABI,
      functionName: "reset",
      args: [BUILDER_CODE],
    });

  useEffect(() => {
    if (hash) {
      toast.success("Transaction sent!");
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Transaction confirmed ✅");
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.message);
    }
  }, [writeError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between bg-white py-20 px-6 dark:bg-black sm:items-start sm:px-16">
        <div className="flex w-full items-center justify-between">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <ConnectButton />
        </div>

        <div className="w-full">
          <h1 className="mt-10 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Base Counter Agent UI
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Connected to Base Mainnet contract with Builder Code attribution.
          </p>

          <div className="mt-10 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="text-sm text-zinc-500">Contract</div>
            <a
              className="break-all text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
              href={`https://basescan.org/address/${COUNTER_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              {COUNTER_ADDRESS}
            </a>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm text-zinc-500">x</div>
                <div className="mt-2 text-4xl font-bold text-black dark:text-white">
                  {xRead.isLoading ? "…" : (xRead.data?.toString() ?? "—")}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="text-sm text-zinc-500">Policy</div>
                <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  min:{" "}
                  <span className="font-semibold">
                    {minRead.isLoading
                      ? "…"
                      : (minRead.data?.toString() ?? "—")}
                  </span>
                  <br />
                  max:{" "}
                  <span className="font-semibold">
                    {maxRead.isLoading
                      ? "…"
                      : (maxRead.data?.toString() ?? "—")}
                  </span>
                  <br />
                  step:{" "}
                  <span className="font-semibold">
                    {stepRead.isLoading
                      ? "…"
                      : (stepRead.data?.toString() ?? "—")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-zinc-500">Builder Code</div>
            <div className="mt-1 font-mono text-sm text-zinc-800 dark:text-zinc-200">
              {BUILDER_CODE}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                inc value
                <input
                  className="w-28 rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-800"
                  type="number"
                  value={incValue}
                  onChange={(e) => setIncValue(Number(e.target.value))}
                />
              </label>

              {!isBaseMainnet && (
                <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
                  You’re connected to the wrong network. Please switch to Base
                  Mainnet.
                  <div className="mt-3">
                    <button
                      onClick={() => switchChain({ chainId: base.id })}
                      disabled={switching}
                      className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {switching ? "Switching..." : "Switch to Base"}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={incBy}
                disabled={!isBaseMainnet || isPending || confirming}
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
              >
                Inc By
              </button>

              <button
                onClick={reset}
                disabled={!isBaseMainnet || isPending || confirming}
                className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-black disabled:opacity-50 dark:border-zinc-700 dark:text-white"
              >
                Reset
              </button>

              <button
                onClick={refetchAll}
                className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-black dark:border-zinc-700 dark:text-white"
              >
                Refresh
              </button>
            </div>

            {(isPending || confirming) && (
              <p className="mt-4 text-sm text-zinc-500">
                {isPending ? "Confirm in wallet…" : "Confirming onchain…"}
              </p>
            )}

            {hash && (
              <p className="mt-2 text-sm">
                Tx:{" "}
                <a
                  className="underline"
                  href={`https://basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Basescan
                </a>
              </p>
            )}

            {writeError && (
              <p className="mt-3 text-sm text-red-500">
                Write error: {writeError.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex gap-4 text-base font-medium">
          <a
            className="flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-background"
            href={`https://basescan.org/address/${COUNTER_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Contract
          </a>
          <a
            className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 dark:border-white/[.145]"
            href="https://basescan.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Basescan
          </a>
        </div>
      </main>
    </div>
  );
}
