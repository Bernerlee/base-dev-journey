export type Action =
  | { type: "NONE"; reason: string }
  | { type: "INC_BY"; value: bigint; reason: string }
  | { type: "RESET"; reason: string };

export function decide(
  x: bigint,
  minX: bigint,
  maxX: bigint,
  step: bigint,
): Action {
  if (x < minX)
    return { type: "INC_BY", value: step, reason: `x=${x} < min=${minX}` };
  if (x > maxX) return { type: "RESET", reason: `x=${x} > max=${maxX}` };
  return { type: "NONE", reason: `x=${x} within range` };
}
