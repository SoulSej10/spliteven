const { withGradleProperties } = require("@expo/config-plugins");

/**
 * Chooses which CPU types the Android build compiles native code for.
 *
 * React Native builds for four by default (arm64-v8a, armeabi-v7a, x86, x86_64),
 * and every one of them ships inside the APK: that is about 80 MB of the ~104 MB
 * universal file. Phones only run the two ARM types; x86 and x86_64 exist for
 * emulators. So the public build keeps just the ARM pair, and a separate EAS
 * profile ("emulator" in eas.json) sets SPLITEVEN_ABIS to build x86_64 for the
 * Android emulator on a PC.
 *
 * SPLITEVEN_ABIS is a comma-separated list, for example "x86_64".
 */
const DEFAULT_ABIS = "arm64-v8a,armeabi-v7a";

module.exports = function withReleaseAbis(config) {
  const abis = (process.env.SPLITEVEN_ABIS || DEFAULT_ABIS).replace(/\s+/g, "");
  return withGradleProperties(config, (config) => {
    const props = config.modResults;
    const existing = props.find((p) => p.type === "property" && p.key === "reactNativeArchitectures");
    if (existing) existing.value = abis;
    else props.push({ type: "property", key: "reactNativeArchitectures", value: abis });
    return config;
  });
};
