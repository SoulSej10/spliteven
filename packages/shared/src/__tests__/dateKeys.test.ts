import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { localDateKey, localMonthKey } from "../dateKeys";
import { computeDailyTotals, computeMonthlyCashFlow, filterTransactionsForMonth } from "../personalFinance";

const original = process.env.TZ;
beforeAll(() => {
  process.env.TZ = "Asia/Manila"; // UTC+8, where the bug showed up
});
afterAll(() => {
  if (original === undefined) delete process.env.TZ;
  else process.env.TZ = original;
});

describe("local calendar keys", () => {
  it("uses the local day, not the UTC day", () => {
    // 6:27 AM on 1 July in Manila is still 30 June in UTC.
    expect(localDateKey("2026-06-30T22:27:00.000Z")).toBe("2026-07-01");
    expect(localMonthKey("2026-06-30T22:27:00.000Z")).toBe("2026-07");
  });

  it("puts early-morning transactions in the right month", () => {
    const tx = [
      { occurred_at: "2026-06-30T22:27:00.000Z", kind: "expense" as const, amount: 10 },
      { occurred_at: "2026-07-01T04:00:00.000Z", kind: "expense" as const, amount: 5 },
    ];
    expect(filterTransactionsForMonth(tx, 2026, 6)).toHaveLength(2);
    expect(filterTransactionsForMonth(tx, 2026, 5)).toHaveLength(0);
    const cash = computeMonthlyCashFlow(tx, 2, new Date("2026-07-15T00:00:00Z"));
    expect(cash.find((m) => m.key === "2026-07")?.expense).toBe(15);
    expect(cash.find((m) => m.key === "2026-06")?.expense).toBe(0);
    expect(computeDailyTotals(tx).map((d) => d.date)).toEqual(["2026-07-01"]);
  });
});
