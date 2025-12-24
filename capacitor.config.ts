import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.dinn.christmas",
  appName: "Holiday.EXE",
  webDir: "out",
  server: {
    // Use the static files from the 'out' directory
    androidScheme: "https",
  },
  ios: {
    // iOS-specific configuration - full screen, no content insets
    contentInset: "never",
    preferredContentMode: "mobile",
    backgroundColor: "#0f0f11",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#0f0f11",
      showSpinner: false,
    },
  },
};

export default config;
