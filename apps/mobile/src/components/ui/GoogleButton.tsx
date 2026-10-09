import { ActivityIndicator, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
      <Path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <Path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
      <Path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
    </Svg>
  );
}

/**
 * "Continue with Google": the standard white button with the colour G, kept white in
 * dark mode too (Google's branding rules), so it reads as a recognisable sign-in option.
 */
export function GoogleButton({
  onPress,
  loading,
  className,
}: {
  onPress: () => void;
  loading?: boolean;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      className={cn(
        "h-14 flex-row items-center justify-center gap-3 rounded-pill border border-[#dadce0] bg-white px-6 active:bg-[#f1f3f4]",
        loading && "opacity-60",
        className
      )}
    >
      {loading ? <ActivityIndicator color="#5f6368" size="small" /> : <GoogleG />}
      <Text className="text-[13px] font-semibold uppercase tracking-wider text-[#3c4043]">Continue with Google</Text>
    </Pressable>
  );
}
