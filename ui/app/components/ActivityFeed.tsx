"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { parseAbiItem } from "viem";
import { COUNTER_ADDRESS, COUNTER_ABI } from "@/lib/counter";

type FeedItem = {
  kind: "BuilderTagged" | "Increment" | "Reset";
  txHash: `0x${string}`;
  blockNumber: bigint;
  timestamp?: number;
  summary: string;
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ActivityFeed() {
  const publicClient = usePublicClient();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const builderTaggedEvent = useMemo(
    () =>
      parseAbiItem(
        "event BuilderTagged(address indexed caller, string action, string builderCode)",
      ),
    [],
  );
  const incrementEvent = useMemo(
    () => parseAbiItem("event Increment(uint256 value)"),
    [],
  );
  const resetEvent = useMemo(() => parseAbiItem("event Reset()"), []);

  // Fetch recent events (last ~5k blocks)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!publicClient) return;
      setLoading(true);

      try {
        const latest = await publicClient.getBlockNumber();
        const fromBlock = latest > 5000n ? latest - 5000n : 0n;

        const [taggedLogs, incLogs, resetLogs] = await Promise.all([
          publicClient.getLogs({
            address: COUNTER_ADDRESS,
            event: builderTaggedEvent,
            fromBlock,
            toBlock: latest,
          }),
          publicClient.getLogs({
            address: COUNTER_ADDRESS,
            event: incrementEvent,
            fromBlock,
            toBlock: latest,
          }),
          publicClient.getLogs({
            address: COUNTER_ADDRESS,
            event: resetEvent,
            fromBlock,
            toBlock: latest,
          }),
        ]);

        // Build feed items
        const merged: FeedItem[] = [];

        for (const log of taggedLogs) {
          const caller = (log.args as any)?.caller as string;
          const action = (log.args as any)?.action as string;
          const builderCode = (log.args as any)?.builderCode as string;

          merged.push({
            kind: "BuilderTagged",
            txHash: log.transactionHash!,
            blockNumber: log.blockNumber!,
            summary: `${action} • ${shortAddr(caller)} • ${builderCode}`,
          });
        }

        for (const log of incLogs) {
          const value = (log.args as any)?.value as bigint;
          merged.push({
            kind: "Increment",
            txHash: log.transactionHash!,
            blockNumber: log.blockNumber!,
            summary: `Increment → ${value.toString()}`,
          });
        }

        for (const log of resetLogs) {
          merged.push({
            kind: "Reset",
            txHash: log.transactionHash!,
            blockNumber: log.blockNumber!,
            summary: `Reset`,
          });
        }

        // Sort newest first
        merged.sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1));

        // Get timestamps for first 10 items (lightweight)
        const top = merged.slice(0, 10);
        const blocks = await Promise.all(
          top.map((x) => publicClient.getBlock({ blockNumber: x.blockNumber })),
        );
        top.forEach((x, i) => {
          x.timestamp = Number(blocks[i].timestamp);
        });

        if (!cancelled) setItems(top);
      } catch (e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [publicClient, builderTaggedEvent, incrementEvent, resetEvent]);

  // Live updates (append new events)
  useWatchContractEvent({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    eventName: "BuilderTagged",
    onLogs: (logs) => {
      setItems((prev) => {
        const next = [...prev];
        for (const log of logs) {
          const caller = (log.args as any)?.caller as string;
          const action = (log.args as any)?.action as string;
          const builderCode = (log.args as any)?.builderCode as string;

          next.unshift({
            kind: "BuilderTagged",
            txHash: log.transactionHash!,
            blockNumber: log.blockNumber!,
            summary: `${action} • ${shortAddr(caller)} • ${builderCode}`,
          });
        }
        return next.slice(0, 10);
      });
    },
  });

  useWatchContractEvent({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    eventName: "Increment",
    onLogs: (logs) => {
      setItems((prev) => {
        const next = [...prev];
        for (const log of logs) {
          const value = (log.args as any)?.value as bigint;
          next.unshift({
            kind: "Increment",
            txHash: log.transactionHash!,
            blockNumber: log.blockNumber!,
            summary: `Increment → ${value.toString()}`,
          });
        }
        return next.slice(0, 10);
      });
    },
  });

  useWatchContractEvent({
    address: COUNTER_ADDRESS,
    abi: COUNTER_ABI,
    eventName: "Reset",
    onLogs: (logs) => {
      setItems((prev) => {
        const next = [...prev];
        for (const log of logs) {
          next.unshift({
            kind: "Reset",
            txHash: log.transactionHash!,
            blockNumber: log.blockNumber!,
            summary: `Reset`,
          });
        }
        return next.slice(0, 10);
      });
    },
  });

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Activity
        </h2>
        <span className="text-xs text-zinc-500">Last 10 events</span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-zinc-500">Loading events…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No recent events found (or RPC limited the log range).
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((it) => (
            <li
              key={`${it.txHash}-${it.kind}-${it.blockNumber.toString()}`}
              className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {it.kind}
                </span>
                <a
                  className="text-xs underline text-zinc-600 dark:text-zinc-300"
                  href={`https://basescan.org/tx/${it.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View tx
                </a>
              </div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300">
                {it.summary}
              </div>
              {it.timestamp && (
                <div className="text-xs text-zinc-500">
                  {new Date(it.timestamp * 1000).toLocaleString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
