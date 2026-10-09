import { Sidebar } from "@/components/app-shell/sidebar";
import { TopBar } from "@/components/app-shell/top-bar";
import { MobileHeader, MobileTabBar } from "@/components/app-shell/mobile-nav";
import { BreadcrumbLabelProvider } from "@/components/app-shell/breadcrumb-context";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { InstallPrompt } from "@/components/pwa/install-prompt";

/**
 * The authenticated app's chrome. At lg+ it's the SaaS dashboard shell: a persistent
 * left sidebar and a top bar with a breadcrumb. Below lg it mirrors the phone app
 * instead: a slim header (avatar -> Settings, back arrow on nested pages) and a
 * fixed bottom tab bar (Home / Groups / Finances / Insights).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbLabelProvider>
      <div className="min-h-dvh bg-background">
        <Sidebar />
        <div className="flex min-h-dvh flex-col lg:pl-64">
          <div className="hidden lg:block">
            <TopBar />
          </div>
          <MobileHeader />
          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 lg:px-8 lg:py-8">
            <InstallPrompt />
            {children}
          </main>
        </div>
        <MobileTabBar />
      </div>
      <OnboardingTour />
    </BreadcrumbLabelProvider>
  );
}
