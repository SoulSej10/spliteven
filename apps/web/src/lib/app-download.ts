export const APP_DOWNLOAD_PATH = "/download/SplitEven.apk";

// EAS preview-build artifacts expire after ~14 days (free tier retention), so
// this is the single place to refresh whenever a new build is cut - see
// PUBLISHING.md for the rebuild command. Served by src/app/download/SplitEven.apk/route.ts.
export const APP_SOURCE_URL = "https://expo.dev/artifacts/eas/LrKLFL6gmNMXVYCnPlcyhHRboC7aL9F4SnCjVAt38kA.apk";
