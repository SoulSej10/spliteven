import { forwardRef } from "react";
import { Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from "react-native";

/** Weight classes already pick a Bricolage weight; adding font-sans on top would let it win and flatten them to regular. */
const HAS_WEIGHT = /(^|\s)(font-(medium|semibold|bold|extrabold)|font-sans)(\s|$)/;
const withFont = (className?: string) => (className && HAS_WEIGHT.test(className) ? className : className ? `font-sans ${className}` : "font-sans");

/**
 * Drop-in Text and TextInput that always carry the app font. React Native only
 * applies a custom font to elements that name one, so plain `<Text>` without a
 * `font-*` weight class fell back to the system font and mixed two typefaces on
 * one screen. Weight classes (font-medium, font-bold...) still override this.
 */
export const Text = forwardRef<RNText, TextProps & { className?: string }>(function Text({ className, ...props }, ref) {
  return <RNText ref={ref} className={withFont(className)} {...props} />;
});

export const TextInput = forwardRef<RNTextInput, TextInputProps & { className?: string }>(function TextInput(
  { className, ...props },
  ref
) {
  return <RNTextInput ref={ref} className={withFont(className)} {...props} />;
});
