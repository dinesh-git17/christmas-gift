import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.dinn.christmas",
  appName: "Christmas Gift",
  webDir: "out",
  server: {
    // Use the static files from the 'out' directory
    androidScheme: "https",
  },
  ios: {
    // iOS-specific configuration
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
};

export default config;
