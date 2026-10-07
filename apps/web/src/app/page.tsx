"use client";

import Link from "next/link";
import { ThemeProvider } from "next-themes";
import {
  ArrowRight,
  ArrowsClockwise,
  ArrowsLeftRight as ArrowLeftRight,
  Bell,
  Calculator,
  Camera,
  ChartPieSlice,
  Check,
  DownloadSimple,
  FileCsv,
  LinkSimple,
  Moon,
  PiggyBank,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
} from "@phosphor-icons/react";
import { PLANS_ENABLED, SUBSCRIPTION_PLANS, type SubscriptionTier } from "@evensplit/shared";
import { cn } from "@/lib/utils";
import { WebScreensCarousel } from "@/components/landing/web-screens-carousel";
import { AutoplayVideo } from "@/components/landing/autoplay-video";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/brand/logo";
import { APP_DOWNLOAD_PATH } from "@/lib/app-download";
import { PENIKO_NAME, PENIKO_URL } from "@/lib/brand";

const webScreens = [
  { src: "/screens/web-dashboard.webp", alt: "Web dashboard with shared balances, personal balance, and your groups", caption: "Your dashboard, shared and personal in one view" },
  { src: "/screens/web-group.webp", alt: "Web group page with who owes whom and recent expenses", caption: "Group balances and settle-up" },
  { src: "/screens/web-insights.webp", alt: "Web Insights page with a personal spending-by-category chart", caption: "Insights by month, personal or shared" },
  { src: "/screens/web-finances.webp", alt: "Web Finances page with total balance and accounts", caption: "Accounts, budgets, and transactions" },
];

const appScreens = [
  { src: "/screens/home.webp", alt: "SplitEven home screen showing total balance and your groups", caption: "Everything at a glance" },
  { src: "/screens/group.webp", alt: "A group overview with who owes whom and recent expenses", caption: "Who owes whom, settled" },
  { src: "/screens/insights.webp", alt: "Insights tab with a spending-by-category donut chart", caption: "See where money goes" },
  { src: "/screens/finances.webp", alt: "Finances tab with accounts and budgets", caption: "Your accounts and budgets" },
];

const splitTypes = [
  { label: "Equal", detail: "Split evenly across everyone" },
  { label: "Exact", detail: "Set each person's amount" },
  { label: "Percentage", detail: "Divide by custom percentages" },
  { label: "Shares", detail: "Weighted by shares, like 2:1:1" },
];

const steps = [
  {
    number: "1",
    title: "Start a group",
    detail: "Name it, add an icon, invite people with a link. No app store required to join.",
  },
  {
    number: "2",
    title: "Log an expense",
    detail: "Enter the amount and pick who paid. Split it equal, exact, by percentage, or by shares.",
  },
  {
    number: "3",
    title: "Settle up",
    detail: "SplitEven works out the minimum number of payments needed to zero everyone out.",
  },
];

const faqs = [
  {
    question: "Does everyone in the group need the app?",
    answer:
      "No. You can invite people by link, and they can view and settle their balance from a browser without installing anything.",
  },
  {
    question: "Can a group use more than one currency?",
    answer:
      "Yes. Every group has its own currency, so one group can run in pesos while another runs in dollars.",
  },
  {
    question: "How does the minimum-payments settle-up work?",
    answer:
      "Instead of everyone paying everyone, SplitEven simplifies the group's debts down to the fewest transactions that get everyone back to even.",
  },
  {
    question: "Can I track my own spending, not just group expenses?",
    answer:
      "Yes. Personal accounts, budgets, categories, and transactions live alongside your groups, completely separate from anyone else's view.",
  },
  {
    question: "Is my personal finance data shared with my groups?",
    answer:
      "Never. Group data (expenses, balances, settlements) is visible to that group's members - that's the point of a shared ledger. Your personal accounts, budgets, and transactions are private to you, always.",
  },
  {
    question: "Can I get my data out?",
    answer:
      "Yes, export your full personal or group ledger to CSV any time from Settings - no lock-in.",
  },
  {
    question: "Is it free?",
    answer: PLANS_ENABLED
      ? "Yes. The Free plan covers splitting expenses and tracking your own money. Pro and Premium add more on top, and you can upgrade whenever you like."
      : "Yes, SplitEven is free to use right now, with every feature included.",
  },
  ...(PLANS_ENABLED
    ? [
        {
          question: "How do I pay for Pro or Premium?",
          answer:
            "Pay directly via GCash, Maya, BDO, or Maribank, then submit your reference number in the app. Your plan is activated once the payment is verified, usually within a day.",
        },
      ]
    : []),
  {
    question: "Does it work on iPhone?",
    answer:
      "SplitEven runs in any browser, including Safari on iPhone. The native app is Android-only for now, with a Google Play listing on the way.",
  },
];

const moreFeatures = [
  { icon: LinkSimple, title: "Invite by link", detail: "Share a link or code and friends join in a tap." },
  { icon: Camera, title: "Receipt photos", detail: "Snap the receipt and keep it attached to the expense." },
  { icon: ArrowsClockwise, title: "Recurring expenses", detail: "Rent and subscriptions post themselves on schedule." },
  { icon: Bell, title: "Push notifications", detail: "Get pinged when someone adds an expense or settles up." },
  { icon: FileCsv, title: "CSV import and export", detail: "Bring your data in, or take it all out, any time." },
  { icon: Moon, title: "Light and dark themes", detail: "Easy on the eyes at any hour, inside the app." },
];

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  ...(PLANS_ENABLED ? [{ href: "#pricing", label: "Pricing" }] : []),
  { href: "#faq", label: "FAQ" },
];

const planCtas: Record<SubscriptionTier, string> = {
  free: "Start free",
  pro: "Get Pro",
  premium: "Get Premium",
};

const financeFeatures = [
  {
    icon: Wallet,
    title: "Multiple accounts",
    detail: "Cash, cards, bank - track balances across everywhere your money actually sits.",
  },
  {
    icon: PiggyBank,
    title: "Budgets by category",
    detail: "Set a monthly limit per category and watch progress as you spend.",
  },
  {
    icon: Calculator,
    title: "Calculator built into every amount",
    detail: "Work out a split or a sum of receipts right where you type the number - no switching apps.",
  },
  {
    icon: ChartPieSlice,
    title: "Spending insights",
    detail: "See where your money goes by category, and how your group spending breaks down too.",
  },
];

// The public landing page always renders light, regardless of a visitor's
// system preference or a logged-in user's stored dark-mode setting (the
// app's theme state persists across the whole site via next-themes) - a
// marketing page shouldn't flip to dark just because someone enabled dark
// mode in their own account settings. `forcedTheme` on a nested ThemeProvider
// overrides the root provider for this subtree only, without disabling dark
// mode anywhere else in the app.
export default function LandingPage() {
  return (
    <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
      <LandingPageContent />
    </ThemeProvider>
  );
}

function LandingPageContent() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-semibold tracking-tight">SplitEven</span>
              <a
                href={PENIKO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 text-[11px] font-medium text-muted-foreground hover:text-primary"
              >
                by {PENIKO_NAME}
              </a>
            </div>
          </div>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Sections">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="rounded-full px-3 sm:px-4">
              <a href={APP_DOWNLOAD_PATH} download aria-label="Download the app">
                <DownloadSimple className="h-4 w-4" />
                <span className="hidden sm:inline">Get the app</span>
              </a>
            </Button>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link href="/login">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero: asymmetric split, real product preview on the right */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pb-28">
          <div
            className="animate-in fade-in slide-in-from-bottom-3 flex flex-col items-start gap-5 duration-700"
            style={{ animationFillMode: "backwards" }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Shared expenses, sorted
            </span>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Split costs. See who owes whom.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              SplitEven keeps every shared expense in one ledger and settles the math in real
              time, so nobody has to be the one who brings it up - plus tracks your own accounts,
              budgets, and spending right alongside it.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="lg" asChild className="rounded-full px-7">
                <Link href="/login">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-6">
                <a href={APP_DOWNLOAD_PATH} download>
                  <DownloadSimple className="mr-1 h-4 w-4" /> Download the app
                </a>
              </Button>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                See how splitting works
              </Link>
            </div>
          </div>

          {/* Real product preview: a live-styled balance card, not a fake screenshot */}
          <div
            className="animate-in fade-in slide-in-from-bottom-4 relative mx-auto w-full max-w-sm duration-700"
            style={{ animationDelay: "120ms", animationFillMode: "backwards" }}
          >
            <div className="absolute -right-4 -top-4 w-[85%] rotate-[4deg] rounded-lg border border-border/60 bg-card p-4 opacity-70 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-lg">
                  🏔️
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">Baguio Trip</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-lg border border-border/60 bg-card p-5 shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-light text-xl">
                  🏠
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">Apartment 4B</p>
                  <div className="mt-1.5 flex -space-x-2">
                    {["MJ", "RC", "AT", "KP"].map((name) => (
                      <Avatar key={name} className="h-6 w-6 border-2 border-card">
                        <AvatarFallback className="text-[10px]">{name}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-semibold tabular-nums text-positive">
                    +₱1,240.00
                  </p>
                  <p className="text-xs text-muted-foreground">you&apos;re owed</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Groceries (Robinsons)</span>
                  <span className="font-mono tabular-nums">₱860.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Wifi, June</span>
                  <span className="font-mono tabular-nums">₱1,499.00</span>
                </div>
              </div>

              <Button size="sm" className="mt-4 w-full rounded-full">
                Settle up
              </Button>
            </div>
          </div>
        </section>

        {/* Promo video: one clip, no autoplay - `preload="none"` means nothing
            downloads until the viewer actually presses play, so the section
            costs nothing on initial page load beyond the poster image. */}
        <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
          <h2 className="mb-5 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            See it in 15 seconds
          </h2>
          <div className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
            <AutoplayVideo
              src="/video/promo.mp4"
              poster="/video/promo-poster.jpg"
              className="aspect-video w-full bg-black"
            />
          </div>
        </section>

        {/* Real app screenshots (Android), lazy-loaded WebP: scroll-snap row on phones, 4-up grid on desktop */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
            The app, up close
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Real screens from the web app and the Android app, not mockups.
          </p>

          <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide text-primary">
            On the web
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing to install. Open it in any browser, on desktop or phone.
          </p>
          <WebScreensCarousel screens={webScreens} />

          <h3 className="mt-14 text-sm font-semibold uppercase tracking-wide text-primary">
            On Android
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The same account and data, in your pocket.
          </p>
          <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {appScreens.map((screen) => (
              <figure key={screen.src} className="w-[62%] shrink-0 snap-center sm:w-[38%] lg:w-auto">
                <div className="overflow-hidden rounded-[1.75rem] border-[5px] border-foreground/90 bg-card shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element -- small static WebP, lazy-loaded; next/image adds nothing here */}
                  <img
                    src={screen.src}
                    alt={screen.alt}
                    width={540}
                    height={1140}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </div>
                <figcaption className="mt-3 text-center text-sm font-medium">{screen.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* How it works: numbered steps, a layout family distinct from the bento/chip/CTA sections below */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
            Three steps, start to settled
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-sm font-semibold text-primary-foreground">
                    {step.number}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden />
                  )}
                </div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features: asymmetric 3-cell bento, not three equal cards */}
        <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything a group needs to stay square
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col justify-between gap-6 rounded-lg border border-border/60 bg-primary p-8 text-primary-foreground md:row-span-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                <ArrowLeftRight className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xl font-semibold">Real-time balances</h3>
                <p className="mt-2 text-sm text-primary-foreground/80">
                  Add an expense and every member sees the updated balance instantly. No group
                  chat spreadsheet, no chasing people down.
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-4 font-mono text-sm">
                <div className="flex justify-between tabular-nums">
                  <span className="text-primary-foreground/70">Mika owes Reg</span>
                  <span>₱620.00</span>
                </div>
                <div className="mt-2 flex justify-between tabular-nums">
                  <span className="text-primary-foreground/70">Ken owes Reg</span>
                  <span>₱310.00</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Users className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-medium">Groups for every crew</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Trips, roommates, couples. Keep each group&apos;s expenses in its own ledger.
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Receipt className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-medium">Receipts and categories</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Attach a photo, tag the category, and filter your ledger later.
              </p>
            </div>
          </div>
        </section>

        {/* Split types: chip row, a different layout family from the bento above */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-lg border border-border/60 bg-card p-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Split it your way</h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              Not every cost divides evenly. Pick the method that fits.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {splitTypes.map((type) => (
                <div
                  key={type.label}
                  className="rounded-lg border border-border/60 bg-background p-4"
                >
                  <p className="font-medium">{type.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{type.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Personal finance: 4-up feature grid with a live-styled dashboard preview, distinct from the group bento above */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
            <div>
              <h2 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
                Your own money, tracked right alongside your groups
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                SplitEven isn&apos;t just for splitting bills. It&apos;s a personal finance app
                too - private to you, never visible to anyone you split expenses with.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {financeFeatures.map((feature) => (
                  <div key={feature.title} className="rounded-lg border border-border/60 bg-card p-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
                      <feature.icon className="h-4 w-4" />
                    </span>
                    <h3 className="mt-3 text-sm font-medium">{feature.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{feature.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live-styled preview, matching the hero card's "real product, not a fake screenshot" approach */}
            <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total balance</p>
                  <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">₱42,180.50</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <Wallet className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 space-y-3 border-t border-border/60 pt-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Groceries budget</span>
                    <span className="font-mono tabular-nums">₱4,200 / ₱6,000</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[70%] rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Transport budget</span>
                    <span className="font-mono tabular-nums">₱1,850 / ₱2,500</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[74%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-border/60 pt-4">
                <p className="text-sm text-muted-foreground">Spending by category</p>
                <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[45%] bg-primary" />
                  <div className="h-full w-[30%] bg-primary/50" />
                  <div className="h-full w-[25%] bg-primary/20" />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Housing 45%
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary/50" /> Food 30%
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary/20" /> Other 25%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Group <-> personal linking: the app's most distinctive idea, shown as a worked example */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                Shared + personal, connected
              </span>
              <h2 className="mt-2 max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
                Fronted the group bill? Your budget knows the difference.
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                When you pay a shared expense from your own account, only your share counts as
                your spending. The rest is tracked as money owed to you, and when friends pay you
                back it&apos;s not mistaken for income.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
              <p className="text-xs text-muted-foreground">You paid for groceries from GCash</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">₱3,000.00</p>
              <div className="mt-5 space-y-3 border-t border-border/60 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Counted as your spending</span>
                  <span className="font-mono tabular-nums">₱750.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tracked as owed to you</span>
                  <span className="font-mono tabular-nums text-positive">₱2,250.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">When they pay you back</span>
                  <span className="text-xs font-medium text-primary">Not counted as income</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* And more: compact grid of the smaller features */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
            And the details that make it stick
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moreFeatures.map((feature) => (
              <div key={feature.title} className="flex gap-4 rounded-lg border border-border/60 bg-card p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <feature.icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-medium">{feature.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{feature.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing: driven by the same plan definitions the in-app Upgrade screen uses; hidden while PLANS_ENABLED is off */}
        {PLANS_ENABLED && (
        <section id="pricing" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
            Simple plans, start free
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Pay with GCash, Maya, BDO, or Maribank. No card needed.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionTier[]).map((tier) => {
              const plan = SUBSCRIPTION_PLANS[tier];
              const featured = tier === "pro";
              return (
                <div
                  key={tier}
                  className={cn(
                    "relative flex flex-col rounded-lg border bg-card p-6",
                    featured ? "border-2 border-accent shadow-md" : "border-border/60"
                  )}
                >
                  {featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{plan.priceLabel}</p>
                  <ul className="mt-5 flex-1 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant={featured ? "default" : "outline"}
                    className="mt-6 w-full rounded-full"
                  >
                    <Link href="/login">{planCtas[tier]}</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
        )}

        {/* Trust strip: privacy + platform availability, single row of two cards */}
        <section id="download" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-medium">Your data, protected</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Row-level security means only you and your groupmates can ever see your data.
                Nothing is sold, and nothing is used for advertising.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                <DownloadSimple className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-medium">On the web, and on Android today</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Use SplitEven right in your browser, or download the Android app directly - a
                Google Play listing is on its way.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-4 rounded-full">
                <a href={APP_DOWNLOAD_PATH} download>
                  <DownloadSimple className="h-4 w-4" /> Download the app
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ: 2-column list, a layout family distinct from every section above */}
        <section id="faq" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
            Questions people actually ask
          </h2>
          <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="border-t border-border/60 pt-4">
                <h3 className="font-medium">{faq.question}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA band: full-width, distinct layout family */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col items-start gap-5 rounded-lg border border-border/60 bg-primary-light p-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Start your first group in a minute
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Free to start. No card required.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Button size="lg" asChild className="rounded-full px-7">
                <Link href="/login">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-6">
                <a href={APP_DOWNLOAD_PATH} download>
                  <DownloadSimple className="mr-1 h-4 w-4" /> Download the app
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Built by Peniko: credits the maker and sends visitors to the company site */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col items-start gap-4 rounded-lg border border-border/60 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Built by {PENIKO_NAME}</p>
              <p className="mt-1.5 font-medium">SplitEven is a {PENIKO_NAME} product.</p>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {PENIKO_NAME} makes friendly software for small businesses. See what else we&apos;re building.
              </p>
            </div>
            <Button variant="outline" asChild className="shrink-0 rounded-full px-6">
              <a href={PENIKO_URL} target="_blank" rel="noopener noreferrer">
                Visit {PENIKO_NAME} <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6">
          <span>
            Powered by{" "}
            <a
              href={PENIKO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              {PENIKO_NAME}
            </a>
            . Built with Next.js, Supabase, and shadcn/ui.
          </span>
          <nav className="flex flex-wrap items-center justify-center gap-4">
            {PLANS_ENABLED && (
              <a href="#pricing" className="hover:text-foreground hover:underline">
                Pricing
              </a>
            )}
            <a href={APP_DOWNLOAD_PATH} download className="hover:text-foreground hover:underline">
              Download the app
            </a>
            <Link href="/privacy-policy" className="hover:text-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground hover:underline">
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
