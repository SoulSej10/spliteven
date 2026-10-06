import { APP_SOURCE_URL } from "@/lib/app-download";

/** Keeps a short, branded download URL on our own domain; GitHub serves the file as SplitEven.apk. */
export function GET() {
  return Response.redirect(APP_SOURCE_URL, 307);
}
