import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Pencil, Tag, Trash as Trash2 } from "phosphor-react-native";
import type { PersonalCategory } from "@evensplit/shared";
import { Card } from "@/components/ui/Card";
import { SkeletonCardRows } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDeletePersonalCategory, usePersonalCategories } from "@/hooks/use-personal";
import { AddCategorySheet } from "@/components/personal/AddCategorySheet";
import { palette } from "@/theme/palette";
import { AppIcon } from "@/components/ui/AppIcon";

/** The "Add" action lives in finances.tsx's floating action button, not inline here - editing an existing category is inline. */
export function CategoriesTabView() {
  const { data: categories, isLoading, isError, refetch } = usePersonalCategories();
  const deleteCategory = useDeletePersonalCategory();
  const [editing, setEditing] = useState<PersonalCategory | null>(null);

  function onDelete(id: string, name: string) {
    Alert.alert(`Delete ${name}?`, "This category will be removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteCategory.mutate(id) },
    ]);
  }

  if (isLoading) return <SkeletonCardRows count={3} />;
  if (isError) return <ErrorState message="Couldn't load categories." onRetry={() => refetch()} />;

  const expenseCategories = categories?.filter((c) => c.kind === "expense") ?? [];
  const incomeCategories = categories?.filter((c) => c.kind === "income") ?? [];

  function Group({ title, items }: { title: string; items: typeof expenseCategories }) {
    return (
      <View className="gap-2">
        <Text className="font-medium text-neutral-500">{title}</Text>
        {items.length === 0 ? (
          <Text className="text-sm text-neutral-500">No categories yet.</Text>
        ) : (
          items.map((c) => (
            <Card key={c.id} className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center gap-2">
                {c.icon ? <AppIcon value={c.icon} size={18} /> : null}
                <Text className="text-neutral-900 dark:text-neutral-100">{c.name}</Text>
              </View>
              <View className="flex-row items-center gap-4">
                <Pressable onPress={() => setEditing(c)} hitSlop={10}>
                  <Pencil color={palette.muted} size={16} />
                </Pressable>
                <Pressable onPress={() => onDelete(c.id, c.name)} hitSlop={10}>
                  <Trash2 color={palette.negative} size={16} />
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </View>
    );
  }

  return (
    <View className="gap-6">
      {categories?.length === 0 && (
        <View className="items-center gap-2 py-14">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-light">
            <Tag color={palette.primary} size={22} />
          </View>
          <Text className="text-sm text-neutral-500">No categories yet.</Text>
        </View>
      )}
      <Group title="Expense categories" items={expenseCategories} />
      <Group title="Income categories" items={incomeCategories} />

      <AddCategorySheet
        visible={!!editing}
        onClose={() => setEditing(null)}
        defaultKind={editing?.kind ?? "expense"}
        category={editing ?? undefined}
      />
    </View>
  );
}
