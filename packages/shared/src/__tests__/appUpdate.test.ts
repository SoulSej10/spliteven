import { describe, expect, it } from "vitest";
import { LATEST_APK_URL, compareVersions, evaluateRelease, parseVersion } from "../appUpdate";

describe("app update check", () => {
  it("parses tags and versions", () => {
    expect(parseVersion("v1.2.3")).toEqual([1, 2, 3]);
    expect(parseVersion("1.2")).toEqual([1, 2, 0]);
    expect(parseVersion("1.2.3-beta")).toEqual([1, 2, 3]);
    expect(parseVersion("nope")).toBeNull();
  });

  it("compares numerically, not as strings", () => {
    expect(compareVersions("1.10.0", "1.9.9")).toBe(1);
    expect(compareVersions("v1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.0.1", "1.1.0")).toBe(-1);
  });

  it("offers an update only for a newer, published release", () => {
    const release = {
      tag_name: "v1.2.0",
      body: " Fresh look ",
      assets: [{ name: "SplitEven.apk", browser_download_url: "https://example.com/SplitEven.apk" }],
    };
    expect(evaluateRelease("1.1.0", release)).toMatchObject({
      latestVersion: "1.2.0",
      notes: "Fresh look",
      downloadUrl: "https://example.com/SplitEven.apk",
    });
    expect(evaluateRelease("1.2.0", release)).toBeNull();
    expect(evaluateRelease("1.3.0", release)).toBeNull();
    expect(evaluateRelease("1.1.0", { ...release, draft: true })).toBeNull();
    expect(evaluateRelease("1.1.0", { ...release, prerelease: true })).toBeNull();
    expect(evaluateRelease("1.1.0", null)).toBeNull();
  });

  it("falls back to the permanent latest-APK link when the asset is missing", () => {
    expect(evaluateRelease("1.0.0", { tag_name: "v1.1.0", assets: [] })?.downloadUrl).toBe(LATEST_APK_URL);
  });
});
