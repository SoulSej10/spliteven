# Publishing SplitEven

Everything needed to get SplitEven onto a device or into an app store, as of this pass. Store listing copy and screenshots live separately in [`store-assets/android/`](store-assets/android/README.md) — this file covers the build/submit workflow itself.

## Current builds

| Type | Format | Use | Link |
|---|---|---|---|
| **Production** | `.aab` | Upload this to Google Play Console | https://expo.dev/artifacts/eas/h5lg-ysawR47FcE9vns8TWfXzqBPKoBQw6RRuMtVyE0.aab |
| **Preview** | `.apk` | Install directly on a phone/emulator for testing | https://expo.dev/artifacts/eas/LrKLFL6gmNMXVYCnPlcyhHRboC7aL9F4SnCjVAt38kA.apk |

The preview `.apk` is built from commit `169ae1f` (versionCode 5, expires 2026-10-17) — includes the Insights Personal/Shared redesign, Android resizable-activity + edge-to-edge support, and the Free/Pro/Premium Upgrade flow with manual GCash/Maya/BDO/Maribank payment. The website serves it as `SplitEven.apk` from `/download/SplitEven.apk`; after cutting a new build, update `APP_SOURCE_URL` in `apps/web/src/lib/app-download.ts`. The production `.aab` above is still from the earlier commit `8c5901d` and needs a fresh `production`-profile build before the next Play Store upload.

**An `.aab` cannot be installed on a device directly** — it's a submission format only; Google Play's servers unpack it into device-specific APKs. For testing on your own phone or the emulator, always use the `.apk` (preview build) instead.

## Installing the preview APK on a phone

1. Open the preview `.apk` link above in your phone's browser and download it.
2. Android will likely block the install the first time — allow it via the prompt, or manually: **Settings → Apps → [your browser] → Install unknown apps → Allow**.
3. Tap the downloaded file to install.

## Installing on the emulator

```bash
curl -L "<preview .apk URL>" -o app.apk
adb uninstall com.evensplit.app   # only needed if a differently-signed build (e.g. local dev client) is already installed
adb install app.apk
```

## Rebuilding

```bash
cd apps/mobile

# Installable APK for testing (internal distribution)
pnpm exec eas build --platform android --profile preview

# Play Store submission format
pnpm exec eas build --platform android --profile production
```

Both profiles already have `SENTRY_DISABLE_AUTO_UPLOAD=true` set in `eas.json` — required because Sentry's Android Gradle plugin (added via `@sentry/react-native`) otherwise hard-fails release builds with "An organization ID or slug is required" whenever no Sentry org/project is configured yet. Remove that flag once a real Sentry project exists and you want source-map uploads.

## Publishing to Google Play (the real path to a public release)

1. **Create a Google Play Developer account** — [play.google.com/console/signup](https://play.google.com/console/signup), $25 one-time fee. This has to be done by you; nothing here can do it for you.
2. **Create the app** in Play Console, package name `com.evensplit.app` (must match `apps/mobile/app.json`).
3. **Upload the production `.aab`** (link above) to a release track. Start with **Internal Testing** — Google requires new accounts to run a closed test before full production release, and it gives you a private install link for testers immediately without any review wait.
4. **Fill out the Data Safety form** — answers should mirror the Privacy Policy (`apps/web/src/app/privacy-policy/page.tsx` / `apps/mobile/src/components/legal/PrivacyPolicyContent.tsx`): collects account info (email, display name, avatar) and financial info (expenses/transactions you enter), encrypted in transit, never sold or shared for advertising, in-app account deletion available.
5. **Complete the content rating questionnaire** (straightforward for a finance/utility app with no user-generated public content).
6. **Add the store listing** — copy, screenshots, and a checklist of what's still missing (feature graphic) are all in [`store-assets/android/README.md`](store-assets/android/README.md).
7. Promote from Internal Testing → Production when ready.

## iOS status

Not started. Needs an Apple Developer Program enrollment ($99/yr, can take Apple a day or two to approve) and a first-ever iOS build attempt — nothing has confirmed the app builds/runs on iOS yet, so budget this as its own effort rather than a quick add-on alongside Android.

## Other things flagged during the pre-launch review, not yet done

These came up while auditing the app for launch-readiness but are separate from the build/submit process above:

- **Enable leaked-password protection** in the Supabase dashboard (Authentication → Auth Settings) — a manual one-click toggle, can't be automated via the tools available here.
- **Monetization** (subscriptions, RevenueCat, etc.) — nothing exists yet; recommended to ship free first, instrument with analytics, and build pricing once there's real usage data.
- **A CI-driven automated EAS build** (trigger a build on every push to `main`, rather than manually) — not set up; the GitHub Actions workflow currently only runs typecheck/test/lint.
- **E2E tests, offline handling, multi-currency conversion, receipt OCR** — noted as gaps in the earlier system audit, all out of scope for getting a first build published.
