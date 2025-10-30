import * as dotenv from "dotenv";
import type { ExpoConfig } from "expo/config";

dotenv.config();

const config: ExpoConfig = {
  name: "Calcula AI",
  slug: "Calcula-AI-APP",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "calculaaiapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.henriquebarucco.calculaai",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: process.env.API_URL,
    eas: {
      projectId: "c5143f5e-a0f4-4547-be44-3ae803b7e2dc"
    }
  },
};

export default config;
