import type { MetadataRoute } from "next";

/** Web app manifest: lets SplitEven be added to a phone's home screen and open full-screen like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SplitEven",
    short_name: "SplitEven",
    description: "Split expenses with friends and keep track of your own money.",
    id: "/dashboard",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f5f3",
    theme_color: "#2f8f7d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
