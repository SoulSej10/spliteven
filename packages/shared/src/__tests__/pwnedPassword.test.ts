import { afterEach, describe, expect, it, vi } from "vitest";
import { checkPwnedPasswordByHash } from "../pwnedPassword";

describe("checkPwnedPasswordByHash", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports a match found in the range response", async () => {
    const suffix = "1E4C9B93F3F0682250B6CF8331B7EE68FD";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(`SOMEOTHERSUFFIX1234567890ABCDEF123:0\n${suffix}:3730471\n`),
      })
    );

    const result = await checkPwnedPasswordByHash(`5BAA6${suffix}`);
    expect(result).toEqual({ pwned: true, count: 3730471 });
  });

  it("reports no match when the suffix isn't in the response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("SOMEOTHERSUFFIX1234567890ABCDEF123:5\n"),
      })
    );

    const result = await checkPwnedPasswordByHash("ABCDE0000000000000000000000000000000000");
    expect(result).toEqual({ pwned: false, count: 0 });
  });

  it("only sends the 5-character hash prefix to the API (k-anonymity)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("") });
    vi.stubGlobal("fetch", fetchMock);

    await checkPwnedPasswordByHash("ABCDE0000000000000000000000000000000000");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.pwnedpasswords.com/range/ABCDE",
      expect.objectContaining({ headers: expect.objectContaining({ "Add-Padding": "true" }) })
    );
  });

  it("throws when the API responds with a non-OK status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(checkPwnedPasswordByHash("ABCDE0000000000000000000000000000000000")).rejects.toThrow("503");
  });
});
