"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

function Section({ title, children }: { title: string; children: string }) {
  return (
    <div className="space-y-1.5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-sm leading-6 text-muted-foreground">{children}</p>
    </div>
  );
}

/**
 * Public page — real, SplitEven-specific terms of service, linked from
 * Settings and available without signing in. Mirrored section-for-section
 * in apps/mobile/src/components/legal/TermsOfServiceContent.tsx — keep both
 * in sync when editing.
 */
export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mb-8 text-xs text-muted-foreground">Last updated: 2026</p>

      <div className="space-y-6">
        <Section title="Acceptance of these terms">
          By creating an account or otherwise using SplitEven, you agree to these Terms of Service and the
          Privacy Policy. If you don&apos;t agree with any part of them, don&apos;t create an account or use
          the app.
        </Section>

        <Section title="Eligibility">
          You must be at least 13 years old (or the minimum age of digital consent in your country, if
          higher) to use SplitEven. By using the app, you confirm that you meet this requirement and that
          any information you provide during account creation is accurate.
        </Section>

        <Section title="What SplitEven is">
          SplitEven is a tool for tracking shared expenses and personal finances between people who trust
          each other. It records what group members say they paid and owe — it does not move money, verify
          payments, or act as a bank, payment processor, money transmitter, or escrow service. Settling up
          happens outside the app (cash, a payment app, a bank transfer); SplitEven just keeps the ledger.
        </Section>

        <Section title="Your account">
          You&apos;re responsible for keeping your login credentials confidential and for all activity that
          happens under your account. Tell us immediately if you suspect unauthorized access. You&apos;re
          also responsible for making sure the email address on your account stays reachable, since it&apos;s
          used for account-recovery and confirmation messages.
        </Section>

        <Section title="Your data is your responsibility">
          Balances, expenses, and settlements are only as accurate as what you and your group members enter.
          SplitEven doesn&apos;t verify that a recorded expense actually happened, that an amount is
          correct, or that a settlement was actually paid outside the app. Double-check anything before
          relying on it for a real financial decision, and resolve disagreements about a shared expense
          directly with the group members involved — SplitEven has no way to mediate or verify real-world
          disputes.
        </Section>

        <Section title="Acceptable use">
          Don&apos;t use SplitEven to store or share anything illegal, fraudulent, or infringing; to harass,
          impersonate, or defraud another user; to try to access another account, group, or data you&apos;re
          not authorized to see; to reverse-engineer, scrape, or overload the app&apos;s infrastructure; or
          to interfere with anyone else&apos;s use of the service.
        </Section>

        <Section title="Intellectual property">
          The SplitEven name, logo, and app design belong to its developer. You keep ownership of the
          content you enter (expense descriptions, notes, your profile photo, and so on) — by entering it,
          you grant SplitEven the limited right to store, process, and display it back to you and, where
          relevant, to your group members, solely to provide the service.
        </Section>

        <Section title="Third-party services">
          SplitEven relies on third-party infrastructure — including Supabase for data storage and
          authentication, Sentry for crash reporting, and Expo&apos;s push notification service — to
          operate. Your use of the app is also subject to the terms of the app store (Apple App Store or
          Google Play) through which you downloaded it.
        </Section>

        <Section title="Availability and changes to the service">
          SplitEven is actively developed, which means features, layouts, and behavior may change, and the
          service may occasionally be unavailable for maintenance or due to factors outside our control. We
          aim to keep disruption minimal but don&apos;t guarantee uninterrupted availability.
        </Section>

        <Section title="Account deletion and termination">
          You can delete your account at any time from Settings. This disables your login permanently and
          removes your personal accounts, transactions, budgets, and categories. Group expenses and
          settlements you were part of stay visible to your former group members (with your profile
          anonymized) so their shared ledger stays accurate — deleting your account doesn&apos;t rewrite
          history other people rely on. Your access may also be suspended or terminated if you violate these
          terms, such as by using the app for acceptable-use violations described above.
        </Section>

        <Section title="No warranty">
          SplitEven is provided &quot;as is&quot; and &quot;as available,&quot; without warranty of any kind,
          express or implied. We work to keep balance calculations correct and the app available, but we
          don&apos;t guarantee it will be error-free, secure, uninterrupted, or fit for any particular
          purpose.
        </Section>

        <Section title="Limitation of liability">
          To the fullest extent permitted by law, SplitEven and its developer aren&apos;t liable for any
          indirect, incidental, or consequential damages, financial loss, dispute between group members, or
          other damages arising from your use of the app, including from inaccurate balances, lost data, or
          downtime — even if advised of the possibility of such damages.
        </Section>

        <Section title="Indemnification">
          You agree to hold SplitEven and its developer harmless from any claim or dispute arising from your
          use of the app, your violation of these terms, or a disagreement between you and another user over
          shared expenses or settlements.
        </Section>

        <Section title="Governing law">
          These terms are governed by the laws of the Republic of the Philippines, without regard to its
          conflict-of-law principles, to the extent permitted by the law of your own jurisdiction.
        </Section>

        <Section title="Resolving disputes">
          If you have a concern about the service, contact us first at the email below so we can try to
          resolve it directly before pursuing any other remedy.
        </Section>

        <Section title="Severability">
          If any part of these terms is found unenforceable, the rest remains in full effect, and the
          unenforceable part will be read to reflect the original intent as closely as possible.
        </Section>

        <Section title="Changes to these terms">
          These terms may be updated as the app changes. Material changes will be reflected here with an
          updated &quot;Last updated&quot; date, and continuing to use SplitEven after an update means you
          accept the revised terms.
        </Section>

        <Section title="Contact">
          Questions about these terms can be sent to jessanthony.tahil10@gmail.com.
        </Section>
      </div>
    </div>
  );
}
