import { forwardRef } from "react";
import { Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from "react-native";

/**
 * Drop-in Text and TextInput that always draw in the app font (Bricolage
 * Grotesque). React Native only uses a custom font when the element names one,
 * and Android does not pick the right file from `font-bold` alone, so bold text
 * silently fell back to the system font. Here the family is set explicitly from
 * the element's weight class (font-medium / semibold / bold / extrabold, or
 * regular when there is none) and applied as an inline style so nothing can
 * override it.
 */
const FAMILY = {
  regular: "Bricolage_400Regular",
  medium: "Bricolage_500Medium",
  semibold: "Bricolage_600SemiBold",
  bold: "Bricolage_700Bold",
  extrabold: "Bricolage_800ExtraBold",
} as const;

type Weight = keyof typeof FAMILY;

const WEIGHT_CLASS = /^font-(medium|semibold|bold|extrabold)$/;

/** The last plain weight class wins, matching how later classes override earlier ones. */
function weightFrom(className?: string): Weight {
  let weight: Weight = "regular";
  if (!className) return weight;
  for (const token of className.split(/\s+/)) {
    const match = WEIGHT_CLASS.exec(token);
    if (match) weight = match[1] as Weight;
  }
  return weight;
}

function fontStyle(className?: string) {
  // fontWeight is reset so Android doesn't fake-bold a face that is already bold.
  return { fontFamily: FAMILY[weightFrom(className)], fontWeight: "normal" } as const;
}

export const Text = forwardRef<RNText, TextProps & { className?: string }>(function Text(
  { className, style, ...props },
  ref
) {
  return <RNText ref={ref} className={className} style={[fontStyle(className), style]} {...props} />;
});

export const TextInput = forwardRef<RNTextInput, TextInputProps & { className?: string }>(function TextInput(
  { className, style, ...props },
  ref
) {
  return <RNTextInput ref={ref} className={className} style={[fontStyle(className), style]} {...props} />;
});
