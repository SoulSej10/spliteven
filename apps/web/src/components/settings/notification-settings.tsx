"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  notificationPermission,
  requestNotificationPermission,
  saveReminderPrefs,
  showReminder,
  useReminderPrefs,
  type ReminderPrefs,
} from "@/lib/reminders";

const ROWS: { key: "daily" | "bills" | "budgets" | "settle"; title: string; description: string }[] = [
  { key: "daily", title: "Daily spending reminder", description: "A nudge to log what you spent." },
  { key: "bills", title: "Bills coming due", description: "The day before a recurring group expense is due." },
  { key: "budgets", title: "Budget alerts", description: "When a budget reaches 80% or goes over." },
  { key: "settle", title: "Settle-up nudge", description: "While you still owe money in a group." },
];

function toTimeValue(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Reminder choices on the web. They show as notifications while SplitEven is open. */
export function NotificationSettings() {
  const prefs = useReminderPrefs();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setPermission(notificationPermission());
  }, []);

  async function ensurePermission(): Promise<boolean> {
    const ok = await requestNotificationPermission();
    setPermission(notificationPermission());
    if (!ok) toast.error("Notifications are blocked. Allow them for this site in your browser settings.");
    return ok;
  }

  async function update(patch: Partial<ReminderPrefs>) {
    const turningOn = Object.entries(patch).some(([k, v]) => k !== "hour" && k !== "minute" && v === true);
    if (turningOn && !(await ensurePermission())) return;
    saveReminderPrefs({ ...prefs, ...patch });
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
          <CardDescription>
            Shown as notifications while SplitEven is open in your browser or installed on your home screen. For
            reminders that arrive when the app is closed, use the Android app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {permission === "unsupported" && (
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              This browser can&apos;t show notifications. On iPhone, add SplitEven to your home screen first.
            </p>
          )}
          {ROWS.map((row) => (
            <div key={row.key} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor={`rem-${row.key}`}>{row.title}</Label>
                  <p className="text-xs text-muted-foreground">{row.description}</p>
                </div>
                <Switch
                  id={`rem-${row.key}`}
                  checked={prefs[row.key]}
                  disabled={permission === "unsupported"}
                  onCheckedChange={(checked) => void update({ [row.key]: checked })}
                />
              </div>
              {row.key === "daily" && prefs.daily && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="rem-time" className="text-xs text-muted-foreground">
                    Every day at
                  </Label>
                  <Input
                    id="rem-time"
                    type="time"
                    className="w-32"
                    value={toTimeValue(prefs.hour, prefs.minute)}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      if (Number.isFinite(h) && Number.isFinite(m)) void update({ hour: h, minute: m });
                    }}
                  />
                </div>
              )}
            </div>
          ))}
          {permission === "granted" && (
            <Button variant="outline" size="sm" onClick={() => void showReminder("SplitEven", "Reminders are working.")}>
              Send a test notification
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
