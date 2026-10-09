import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useQueryClient } from "@tanstack/react-query";
import { CaretRight as ChevronRight, Download, Upload } from "phosphor-react-native";
import { Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/Card";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { useAuth } from "@/hooks/use-auth";
import { usePersonalAccounts, usePersonalCategories, usePersonalTransactions } from "@/hooks/use-personal";
import { importPersonalLedgerRows } from "@/lib/api/personal";
import {
  buildPersonalLedgerCsv,
  exportAndShareCsv,
  parsePersonalLedgerCsv,
  readCsvFile,
  summarizePersonalImport,
} from "@/lib/csv";
import { palette } from "@/theme/palette";

/** Back up your personal ledger to a CSV file, or bring one in. */
export default function DataSettingsScreen() {
  const { authUser, profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: transactions } = usePersonalTransactions();
  const { data: accounts } = usePersonalAccounts();
  const { data: categories } = usePersonalCategories();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function onExport() {
    if (!transactions || transactions.length === 0) {
      Alert.alert("Nothing to export", "Log a few transactions first.");
      return;
    }
    setExporting(true);
    try {
      const csv = buildPersonalLedgerCsv(transactions, accounts ?? [], categories ?? []);
      const shared = await exportAndShareCsv(`evensplit-personal-${Date.now()}.csv`, csv);
      if (!shared) Alert.alert("Sharing isn't available", "Couldn't open the share sheet on this device.");
    } catch (err) {
      Alert.alert("Export failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setExporting(false);
    }
  }

  async function onImport() {
    if (!authUser) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "text/csv" });
      if (result.canceled || !result.assets?.[0]) return;
      setImporting(true);
      const csvText = await readCsvFile(result.assets[0].uri);
      const { rows, errors } = parsePersonalLedgerCsv(csvText);
      if (rows.length === 0) {
        Alert.alert("No rows found", errors[0] ?? "Couldn't read any valid rows from that file.");
        return;
      }
      const summary = summarizePersonalImport(rows, accounts ?? [], categories ?? []);
      const details = [
        `${summary.rowCount} transaction${summary.rowCount === 1 ? "" : "s"} found.`,
        summary.newAccounts.length > 0 ? `New accounts: ${summary.newAccounts.join(", ")}` : null,
        summary.newCategories.length > 0 ? `New categories: ${summary.newCategories.join(", ")}` : null,
        errors.length > 0 ? `${errors.length} row(s) will be skipped.` : null,
      ]
        .filter(Boolean)
        .join("\n");

      Alert.alert("Import this file?", details, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: async () => {
            try {
              const { imported } = await importPersonalLedgerRows(
                authUser.id,
                rows,
                accounts ?? [],
                categories ?? [],
                profile?.default_currency ?? "PHP"
              );
              await queryClient.invalidateQueries({ queryKey: ["personal-transactions", authUser.id] });
              await queryClient.invalidateQueries({ queryKey: ["personal-accounts", authUser.id] });
              await queryClient.invalidateQueries({ queryKey: ["personal-categories", authUser.id] });
              Alert.alert("Import complete", `${imported} transaction${imported === 1 ? "" : "s"} added.`);
            } catch (err) {
              Alert.alert("Import failed", err instanceof Error ? err.message : "Try again");
            }
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Could not read file", err instanceof Error ? err.message : "Try again");
    } finally {
      setImporting(false);
    }
  }

  return (
    <SettingsScreen title="Export & import">
      <Card className="gap-1">
        <Text className="mb-1 text-xs text-neutral-500">
          Your personal ledger as a CSV file: keep a backup, open it in a spreadsheet, or move it between accounts.
        </Text>
        <Pressable onPress={onExport} disabled={exporting} className="flex-row items-center justify-between py-2.5">
          <View className="flex-row items-center gap-2.5">
            <Download size={17} color={palette.primary} />
            <Text className="text-neutral-900 dark:text-neutral-100">{exporting ? "Preparing…" : "Export data (CSV)"}</Text>
          </View>
          <ChevronRight color={palette.muted} size={17} />
        </Pressable>
        <Pressable onPress={onImport} disabled={importing} className="flex-row items-center justify-between py-2.5">
          <View className="flex-row items-center gap-2.5">
            <Upload size={17} color={palette.primary} />
            <Text className="text-neutral-900 dark:text-neutral-100">{importing ? "Reading file…" : "Import data (CSV)"}</Text>
          </View>
          <ChevronRight color={palette.muted} size={17} />
        </Pressable>
      </Card>
    </SettingsScreen>
  );
}
