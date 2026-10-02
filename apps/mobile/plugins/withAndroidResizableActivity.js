const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Explicitly marks MainActivity as resizeable so the app behaves correctly
 * in Android's multi-window, split-screen, and floating/freeform window
 * modes - a standard feature on newer phones (Samsung's Pop-up View, Pixel
 * and other OEMs' desktop/freeform windowing) and increasingly required for
 * Play Store large-screen compatibility. `resizeableActivity` actually
 * defaults to true for apps targeting API 24+, but some OEM launchers and
 * Play Console's large-screen checks look for it declared explicitly rather
 * than trusting the default, so this makes it unambiguous instead of
 * implicit. The `android/` folder is Continuous Native Generation (CNG)
 * managed - regenerated from this config on every prebuild - so this can't
 * just be hand-edited into AndroidManifest.xml directly, it has to be a
 * plugin.
 */
module.exports = function withAndroidResizableActivity(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    const mainActivity = application?.activity?.find(
      (activity) => activity.$["android:name"] === ".MainActivity"
    );
    if (mainActivity) {
      mainActivity.$["android:resizeableActivity"] = "true";
    }
    return config;
  });
};
