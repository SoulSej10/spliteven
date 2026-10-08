import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Bell, Crown, CaretLeft as ChevronLeft, CaretRight as ChevronRight, Stack as Layers, Receipt } from "phosphor-react-native";
import {
  computeCategoryBreakdown,
  computeDailyTotals,
  computeSharedFinanceSummary,
  filterTransactionsForMonth,
  type DailyTotal,
} from "@evensplit/shared";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SkeletonCardRows } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { DonutChart } from "@/components/ui/DonutChart";
import { MonthCalendar } from "@/components/ui/MonthCalendar";
import { CategoryBreakdownList } from "@/components/ui/CategoryBreakdownList";
import { Button } from "@/components/ui/Button";
import { PLAN_FEATURE_COPY } from "@evensplit/shared";
import { usePlan } from "@/hooks/use-plan";
import { useAuth } from "@/hooks/use-auth";
import { useSettingsDrawer } from "@/context/settings-drawer";
import { useMyGroups, useAllExpenses } from "@/hooks/use-groups";
import { usePersonalAccounts, usePersonalCategories, usePersonalTransactions } from "@/hooks/use-personal";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import { PageTour, usePageTour } from "@/components/onboarding/PageTour";
import { palette } from "@/theme/palette";
import { DONUT_COLORS } from "@/theme/chartColors";

const CATEGORY_ALL = "__all__";
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function CategoryDonut({
  title,
  total,
  currency,
  categories,
}: {
  title: string;
  total: number;
  currency: string;
  categories: { label: string; icon?: string | null; amount: number }[];
}) {
  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</Text>
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {formatMoney(total, currency)}
        </Text>
      </View>
      <DonutChart
        centerLabel={formatMoney(total, currency)}
        segments={categories.map((c, i) => ({
          label: c.label,
          value: c.amount,
          color: DONUT_COLORS[i % DONUT_COLORS.length],
        }))}
      />
      <CategoryBreakdownList
        currency={currency}
        rows={categories.map((c, i) => ({
          label: c.label,
          icon: c.icon,
          amount: c.amount,
          percent: total > 0 ? (c.amount / total) * 100 : 0,
          color: DONUT_COLORS[i % DONUT_COLORS.length],
        }))}
      />
    </Card>
  );
}

/**
 * Top-level Insights tab. Personal vs Shared replaces the old Charts vs
 * Calendar split - the calendar isn't a separate mode anymore, it's part of
 * whichever side (personal or shared) you're looking at, right below that
 * side's chart. A single month navigator drives both the chart and the
 * calendar together so they always describe the same period - previously
 * the chart silently meant "the real current month" while the calendar had
 * its own independently-navigable month, which could show two different
 * periods on screen at once with no indication they disagreed.
 */
export default function InsightsScreen() {
  const { profile, authUser } = useAuth();
  const { open: openSettings } = useSettingsDrawer();
  const { data: groups } = useMyGroups();
  const { data: expenses, isLoading, isError, refetch } = useAllExpenses();
  const { data: personalTransactions } = usePersonalTransactions();
  const { data: personalCategories } = usePersonalCategories();
  const { data: personalAccounts } = usePersonalAccounts();

  const [view, setView] = useState<"personal" | "shared">("personal");
  const [categoryFilter, setCategoryFilter] = useState<string>(CATEGORY_ALL);
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const statsRef = useRef<View>(null);
  const viewToggleRef = useRef<View>(null);
  const chartsRef = useRef<View>(null);
  const { replaySignal } = usePageTour("insights");
  const { allows } = usePlan();
  const locked = !allows("insights");

  const personalCurrency = personalAccounts?.[0]?.currency ?? "PHP";
  const monthKey = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, "0")}`;

  // Everything below is scoped to `calendarDate`'s month (not "now"), so the
  // chart and the calendar underneath it always agree on which period
  // they're describing, and the prev/next arrows move both together.
  const monthTransactions = useMemo(
    () => filterTransactionsForMonth(personalTransactions ?? [], calendarDate.getFullYear(), calendarDate.getMonth()),
    [personalTransactions, calendarDate]
  );

  const personalBreakdown = useMemo(
    () => computeCategoryBreakdown(monthTransactions, personalCategories ?? [], "expense"),
    [monthTransactions, personalCategories]
  );
  const personalMonthTotal = personalBreakdown.reduce((sum, c) => sum + c.amount, 0);

  const sharedSummary = useMemo(() => computeSharedFinanceSummary(monthTransactions), [monthTransactions]);

  const monthExpenses = useMemo(
    () => (expenses ?? []).filter((e) => e.expense_date.slice(0, 7) === monthKey),
    [expenses, monthKey]
  );

  /** This user's own share of this month's group expenses, per currency — never blended. */
  const sharedParticipationByCurrency = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of monthExpenses) {
      const myShare = e.expense_shares.find((s) => s.user_id === authUser?.id)?.share_amount ?? 0;
      totals.set(e.currency, (totals.get(e.currency) ?? 0) + myShare);
    }
    return [...totals.entries()].filter(([, amount]) => amount > 0.005);
  }, [monthExpenses, authUser]);

  const hasPersonalNarrative = personalMonthTotal > 0.005;
  const hasSharedNarrative =
    sharedParticipationByCurrency.length > 0 || sharedSummary.advanced > 0.005 || sharedSummary.recovered > 0.005;

  /** Group spending by category per currency, scoped to the selected month like everything else here. */
  const byCurrency = useMemo(() => {
    const groups = new Map<string, { label: string; amount: number }[]>();
    const totals = new Map<string, number>();
    for (const e of monthExpenses) {
      totals.set(e.currency, (totals.get(e.currency) ?? 0) + e.amount);
      // category is free text, not an enum - lowercase it for grouping so
      // "Food" and "food" don't split into two entries.
      const key = e.category?.trim().toLowerCase() || "other";
      const list = groups.get(e.currency) ?? [];
      const existing = list.find((l) => l.label === key);
      if (existing) existing.amount += e.amount;
      else list.push({ label: key, amount: e.amount });
      groups.set(e.currency, list);
    }
    return [...groups.entries()]
      .map(([currency, categories]) => ({
        currency,
        total: totals.get(currency) ?? 0,
        categories: categories.sort((a, b) => b.amount - a.amount).slice(0, 6),
      }))
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses]);

  /** All free-text group-expense category labels seen this month, for the calendar filter pills. */
  const groupCategoryLabels = useMemo(() => {
    const labels = new Set<string>();
    for (const e of monthExpenses) labels.add(e.category?.trim().toLowerCase() || "other");
    return [...labels].sort();
  }, [monthExpenses]);

  /** Group expenses (all currencies mixed — the calendar is a date-shape view, not a totals view) as daily totals. */
  const groupDailyTotals: DailyTotal[] = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of monthExpenses) {
      const label = e.category?.trim().toLowerCase() || "other";
      if (categoryFilter !== CATEGORY_ALL && label !== categoryFilter) continue;
      const day = e.expense_date.slice(0, 10);
      totals.set(day, (totals.get(day) ?? 0) + e.amount);
    }
    return [...totals.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, expense]) => ({ date, expense, income: 0 }));
  }, [monthExpenses, categoryFilter]);

  const personalDailyTotals = useMemo(() => computeDailyTotals(monthTransactions), [monthTransactions]);

  function goToMonth(delta: number) {
    setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-neutral-900" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pb-1 pt-3">
        <Pressable
          onPress={openSettings}
          className="flex-row items-center gap-2.5 active:opacity-70"
          accessibilityLabel="Settings"
        >
          <Avatar name={profile?.display_name} uri={profile?.avatar_url} size={38} />
        </Pressable>
        <Pressable
          onPress={() => router.navigate("/(app)/(tabs)/activity")}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface active:opacity-70 dark:bg-surface-dark"
          accessibilityLabel="Activity"
        >
          <Bell color={palette.ink} size={18} />
        </Pressable>
      </View>

      <View className="px-5 pb-2 pt-1">
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Insights</Text>
        <Text className="text-neutral-500">Where your money is going</Text>
      </View>

      <ScrollView contentContainerClassName="gap-4 px-5 pb-4 pt-2" showsVerticalScrollIndicator={false}>
        {isLoading && <SkeletonCardRows count={3} />}

        {!isLoading && isError && (
          <ErrorState message="Couldn't load insights." onRetry={() => refetch()} />
        )}

        {!isLoading && !isError && (
          <View ref={statsRef} collapsable={false} className="flex-row gap-3">
            <Card className="flex-1 items-start gap-1">
              <Layers color={palette.primary} size={18} />
              <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {groups?.length ?? 0}
              </Text>
              <Text className="text-xs text-neutral-500">Active groups</Text>
            </Card>
            <Card className="flex-1 items-start gap-1">
              <Receipt color={palette.primary} size={18} />
              <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {expenses?.length ?? 0}
              </Text>
              <Text className="text-xs text-neutral-500">Expenses logged</Text>
            </Card>
          </View>
        )}

        {!isLoading && !isError && locked && (
          <Card className="items-center gap-3 border-2 border-accent bg-accent/10 py-6">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <Crown size={24} color={palette.highlight} weight="fill" />
            </View>
            <Text className="text-center text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {PLAN_FEATURE_COPY.insights.title}
            </Text>
            <Text className="text-center text-sm text-neutral-500">
              See where your money goes with monthly charts and a spending calendar, for both personal and shared
              expenses.
            </Text>
            <Button size="sm" onPress={() => router.push("/(app)/upgrade")}>
              See plans
            </Button>
          </Card>
        )}

        {!isLoading && !isError && !locked && (
          <View ref={viewToggleRef} collapsable={false}>
            <SegmentedControl
              value={view}
              onChange={setView}
              options={[
                { label: "Personal", value: "personal" },
                { label: "Shared", value: "shared" },
              ]}
            />
          </View>
        )}

        {!isLoading && !isError && !locked && (
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => goToMonth(-1)}
              hitSlop={10}
              className="h-8 w-8 items-center justify-center rounded-lg bg-neutral-500/10"
            >
              <ChevronLeft color={palette.muted} size={16} />
            </Pressable>
            <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
            </Text>
            <Pressable
              onPress={() => goToMonth(1)}
              hitSlop={10}
              className="h-8 w-8 items-center justify-center rounded-lg bg-neutral-500/10"
            >
              <ChevronRight color={palette.muted} size={16} />
            </Pressable>
          </View>
        )}

        {!isLoading && !isError && !locked && view === "personal" && (
          <View ref={chartsRef} collapsable={false} className="gap-4">
            {hasPersonalNarrative && (
              <Card className="gap-1.5">
                <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {MONTH_NAMES[calendarDate.getMonth()]}
                </Text>
                <Text className="text-sm text-neutral-700 dark:text-neutral-300">
                  You spent {formatMoney(personalMonthTotal, personalCurrency)} personally.
                </Text>
              </Card>
            )}

            {personalBreakdown.length > 0 ? (
              <CategoryDonut
                title="Personal spending by category"
                total={personalMonthTotal}
                currency={personalCurrency}
                categories={personalBreakdown.map((c) => ({
                  label: c.category_name,
                  icon: personalCategories?.find((cat) => cat.id === c.category_id)?.icon,
                  amount: c.amount,
                }))}
              />
            ) : (
              <Text className="rounded-card border border-dashed border-neutral-500/25 py-14 text-center text-sm text-neutral-500">
                No personal expenses this month.
              </Text>
            )}

            <Card className="gap-3">
              <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Calendar</Text>
              <MonthCalendar
                year={calendarDate.getFullYear()}
                month={calendarDate.getMonth()}
                dailyTotals={personalDailyTotals}
                kind="expense"
                currency={personalCurrency}
                onPrevMonth={() => goToMonth(-1)}
                onNextMonth={() => goToMonth(1)}
              />
            </Card>
          </View>
        )}

        {!isLoading && !isError && !locked && view === "shared" && (
          <View className="gap-4">
            {hasSharedNarrative && (
              <Card className="gap-1.5">
                <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {MONTH_NAMES[calendarDate.getMonth()]}
                </Text>
                {sharedParticipationByCurrency.map(([currency, amount]) => (
                  <Text key={currency} className="text-sm text-neutral-700 dark:text-neutral-300">
                    You were part of {formatMoney(amount, currency)} in shared group spending.
                  </Text>
                ))}
                {(sharedSummary.advanced > 0.005 || sharedSummary.recovered > 0.005) && (
                  <Text className="text-sm text-neutral-700 dark:text-neutral-300">
                    You've advanced {formatMoney(sharedSummary.advanced, personalCurrency)} for others and recovered{" "}
                    {formatMoney(sharedSummary.recovered, personalCurrency)}
                    {sharedSummary.outstanding > 0.005
                      ? `, with ${formatMoney(sharedSummary.outstanding, personalCurrency)} still outstanding.`
                      : "."}
                  </Text>
                )}
              </Card>
            )}

            {byCurrency.length > 0 ? (
              byCurrency.map(({ currency, total, categories }) => (
                <CategoryDonut
                  key={currency}
                  title={`Spending by category · ${currency}`}
                  total={total}
                  currency={currency}
                  categories={categories}
                />
              ))
            ) : (
              <Text className="rounded-card border border-dashed border-neutral-500/25 py-14 text-center text-sm text-neutral-500">
                No group expenses this month.
              </Text>
            )}

            <Card className="gap-3">
              <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Calendar</Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => setCategoryFilter(CATEGORY_ALL)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5",
                    categoryFilter === CATEGORY_ALL ? "border-primary bg-primary-light" : "border-neutral-500/20"
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-medium",
                      categoryFilter === CATEGORY_ALL ? "text-primary-deep" : "text-neutral-500"
                    )}
                  >
                    All categories
                  </Text>
                </Pressable>
                {groupCategoryLabels.map((label) => (
                  <Pressable
                    key={label}
                    onPress={() => setCategoryFilter(label)}
                    className={cn(
                      "rounded-pill border px-3 py-1.5",
                      categoryFilter === label ? "border-primary bg-primary-light" : "border-neutral-500/20"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-xs font-medium capitalize",
                        categoryFilter === label ? "text-primary-deep" : "text-neutral-500"
                      )}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text className="text-[10px] text-neutral-500">
                Amounts mix currencies across groups — use this view for activity shape, not totals.
              </Text>
              <MonthCalendar
                year={calendarDate.getFullYear()}
                month={calendarDate.getMonth()}
                dailyTotals={groupDailyTotals}
                kind="expense"
                currency={byCurrency[0]?.currency ?? personalCurrency}
                onPrevMonth={() => goToMonth(-1)}
                onNextMonth={() => goToMonth(1)}
              />
            </Card>
          </View>
        )}
      </ScrollView>

      <PageTour
        tourKey="insights"
        replaySignal={replaySignal}
        steps={[
          {
            ref: statsRef,
            title: "Your activity at a glance",
            body: "A quick count of your active groups and how many expenses you've logged across all of them.",
          },
          {
            ref: viewToggleRef,
            title: "Personal or Shared",
            body: "Switch between your own spending and your groups' shared spending - each with its own chart and calendar.",
          },
          {
            ref: chartsRef,
            title: "Chart and calendar together",
            body: "See a category breakdown and a day-by-day calendar for the same month, side by side.",
          },
        ]}
      />
    </SafeAreaView>
  );
}
