import { CONFIG } from "./config.js";
import { log, warn, err } from "./logger.js";
import {
  readX,
  readMinX,
  readMaxX,
  readStep,
  incBy,
  reset,
} from "./counter.js";
import { decide } from "./policy.js";
import { publicClient } from "./base.js";

let lastResetTimestamp = 0;
const RESET_COOLDOWN_SECONDS = 300; // 5 minutes

type DayState = { day: string; txCount: number };
let dayState: DayState = { day: new Date().toDateString(), txCount: 0 };

function rolloverDayIfNeeded() {
  const today = new Date().toDateString();
  if (dayState.day !== today) dayState = { day: today, txCount: 0 };
}

async function maybeNotify(msg: string) {
  if (!CONFIG.discordWebhookUrl) return;
  try {
    await fetch(CONFIG.discordWebhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: msg }),
    });
  } catch (e) {
    warn("Discord notify failed:", e);
  }
}

export async function tick() {
  rolloverDayIfNeeded();

  // ✅ Read onchain state + onchain policy
  const [x, minX, maxX, step] = await Promise.all([
    readX(),
    readMinX(),
    readMaxX(),
    readStep(),
  ]);

  // ✅ Decide using onchain policy (not CONFIG.*)
  const action = decide(x, minX, maxX, step);

  log(
    "x =",
    x.toString(),
    "| policy:",
    `[min=${minX.toString()} max=${maxX.toString()} step=${step.toString()}]`,
    "| decision:",
    action.type,
    "|",
    action.reason,
  );

  if (action.type === "NONE") return;

  if (dayState.txCount >= CONFIG.maxTxPerDay) {
    warn("Daily tx limit reached:", dayState.txCount);
    return;
  }

  try {
    let hash: `0x${string}`;
    if (action.type === "INC_BY") hash = await incBy(action.value);
    else {
      const now = Math.floor(Date.now() / 1000);
      if (now - lastResetTimestamp < RESET_COOLDOWN_SECONDS) {
        warn("Reset skipped due to cooldown.");
        return;
      }
      hash = await reset();
      lastResetTimestamp = now;
    }

    dayState.txCount += 1;

    log("sent tx:", hash);
    await maybeNotify(
      `✅ CounterManager sent tx: ${hash} | action=${action.type}`,
    );

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    log("confirmed in block:", receipt.blockNumber.toString());
  } catch (e: any) {
    err("action failed:", e?.message || e);
    await maybeNotify(`❌ CounterManager failed: ${e?.message || e}`);
  }
}

export async function runForever() {
  log("CounterManager starting…");
  while (true) {
    try {
      await tick();
    } catch (e) {
      err("tick crashed:", e);
    }
    await new Promise((r) => setTimeout(r, CONFIG.loopSeconds * 1000));
  }
}
