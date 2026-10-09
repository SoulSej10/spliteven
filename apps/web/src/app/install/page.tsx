import Link from "next/link";
import { ArrowLeft, DeviceMobile, DotsThreeVertical, DownloadSimple, PlusSquare, ShareNetwork } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand/logo";
import { APP_DOWNLOAD_PATH } from "@/lib/app-download";

export const metadata = {
  title: "Install SplitEven",
  description: "Add SplitEven to your iPhone or Android home screen.",
};

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary-deep">
        {n}
      </span>
      <p className="pt-0.5 text-sm leading-6 text-foreground/90">{children}</p>
    </li>
  );
}

/** Public install guide: iPhone (home-screen web app) and Android (APK or home-screen web app). */
export default function InstallPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <Logo size={44} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Install SplitEven</h1>
          <p className="text-sm text-muted-foreground">Open it like an app, straight from your home screen.</p>
        </div>
      </div>

      <section className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
          <DeviceMobile className="h-5 w-5 text-primary-deep" /> iPhone &amp; iPad
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">Use Safari. It takes about ten seconds and needs no App Store.</p>
        <ol className="space-y-3.5">
          <Step n={1}>
            Open <span className="font-semibold">evensplit-eight.vercel.app</span> in <span className="font-semibold">Safari</span>.
          </Step>
          <Step n={2}>
            Tap the <ShareNetwork className="mx-0.5 inline h-4 w-4 align-text-bottom" /> <span className="font-semibold">Share</span> button
            in the toolbar.
          </Step>
          <Step n={3}>
            Scroll down and tap <PlusSquare className="mx-0.5 inline h-4 w-4 align-text-bottom" />{" "}
            <span className="font-semibold">Add to Home Screen</span>, then <span className="font-semibold">Add</span>.
          </Step>
          <Step n={4}>Open SplitEven from your home screen. Sign in once and you stay signed in.</Step>
        </ol>
      </section>

      <section className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
          <DeviceMobile className="h-5 w-5 text-primary-deep" /> Android
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">Two ways, pick whichever you prefer.</p>
        <ol className="space-y-3.5">
          <Step n={1}>
            <span className="font-semibold">Full app:</span>{" "}
            <a href={APP_DOWNLOAD_PATH} download className="inline-flex items-center gap-1 font-semibold text-primary-deep underline underline-offset-2">
              <DownloadSimple className="h-4 w-4" /> download the APK
            </a>{" "}
            and open it. If Android asks, allow installs from your browser.
          </Step>
          <Step n={2}>
            <span className="font-semibold">Or from the browser:</span> in Chrome tap{" "}
            <DotsThreeVertical className="mx-0.5 inline h-4 w-4 align-text-bottom" weight="bold" /> then{" "}
            <span className="font-semibold">Add to Home screen</span>.
          </Step>
        </ol>
      </section>

      <p className="px-1 text-xs leading-5 text-muted-foreground">
        The home-screen version is the same SplitEven as the website, so it updates by itself. Fingerprint sign-in and the
        app lock are only in the Android app.
      </p>
    </div>
  );
}
