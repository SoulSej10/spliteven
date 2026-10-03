import { APP_SOURCE_URL } from "@/lib/app-download";

// The build is ~100 MB, so allow slow mobile connections time to finish.
export const maxDuration = 300;

/** Streams the latest Android build under a stable, friendly file name instead of the artifact hash. */
export async function GET() {
  const upstream = await fetch(APP_SOURCE_URL);
  if (!upstream.ok || !upstream.body) {
    return new Response("The Android app download is temporarily unavailable.", { status: 502 });
  }

  const headers = new Headers({
    "Content-Type": "application/vnd.android.package-archive",
    "Content-Disposition": 'attachment; filename="SplitEven.apk"',
    "Cache-Control": "public, max-age=300, s-maxage=3600",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { headers });
}
