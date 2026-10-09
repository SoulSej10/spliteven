import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "phosphor-react-native";
import { Text } from "@/components/ui/typography";
import { CurrencyRatesCard } from "@/components/personal/CurrencyRatesCard";
import { palette } from "@/theme/palette";

/** Currency rates on their own screen, reachable from Settings and from Add account. */
export default function CurrencyRatesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <View className="flex-row items-center gap-3 px-5 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-surface-dark"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={18} color={palette.ink} />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Currency rates</Text>
      </View>
      <ScrollView contentContainerClassName="gap-4 px-5 py-5" showsVerticalScrollIndicator={false}>
        <CurrencyRatesCard />
      </ScrollView>
    </SafeAreaView>
  );
}
