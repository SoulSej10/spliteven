/**
 * In-app update check for the sideloaded Android build. Each build is published
 * as a release of the public download repo (see PUBLISHING.md); the app asks
 * GitHub for the latest release and compares its tag with the installed version.
 */
export const APP_RELEASES_REPO = "SoulSej10/spliteven-app";
export const LATEST_RELEASE_API = `https://api.github.com/repos/${APP_RELEASES_REPO}/releases/latest`;
export const APK_ASSET_NAME = "SplitEven.apk";
/** Always the newest release's APK, so it never needs updating. */
export const LATEST_APK_URL = `https://github.com/${APP_RELEASES_REPO}/releases/latest/download/${APK_ASSET_NAME}`;

/** "v1.2.3", "1.2.3" or "1.2.3-beta" -> [1, 2, 3]; anything unparseable -> null. */
export function parseVersion(input: string | null | undefined): [number, number, number] | null {
  if (!input) return null;
  const match = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(input.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

/** 1 when `a` is newer than `b`, -1 when older, 0 when equal or either is unparseable. */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

export interface GithubReleaseLike {
  tag_name?: string;
  name?: string | null;
  body?: string | null;
  published_at?: string | null;
  draft?: boolean;
  prerelease?: boolean;
  assets?: { name?: string; browser_download_url?: string }[];
}

export interface AppUpdateInfo {
  currentVersion: string;
  latestVersion: string;
  /** Release notes as written on the release, trimmed. */
  notes: string;
  downloadUrl: string;
  publishedAt: string | null;
}

/** The update to offer, or null when the installed app is current (or the release is unusable). */
export function evaluateRelease(currentVersion: string, release: GithubReleaseLike | null | undefined): AppUpdateInfo | null {
  if (!release || release.draft || release.prerelease || !release.tag_name) return null;
  const latest = parseVersion(release.tag_name);
  if (!latest || compareVersions(release.tag_name, currentVersion) <= 0) return null;
  const apk = release.assets?.find((a) => a.name === APK_ASSET_NAME && a.browser_download_url);
  return {
    currentVersion,
    latestVersion: latest.join("."),
    notes: (release.body ?? "").trim(),
    downloadUrl: apk?.browser_download_url ?? LATEST_APK_URL,
    publishedAt: release.published_at ?? null,
  };
}
