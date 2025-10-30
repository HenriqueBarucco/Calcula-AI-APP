import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "../context/SessionContext";

// Keep splash screen visible while we load fonts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <Stack
            screenOptions={{
              headerTitle: () => (
                <Text
                  style={{
                    fontFamily: "SpaceMono",
                    fontSize: 20,
                    letterSpacing: 0.5,
                  }}
                >
                  Calcula AI
                </Text>
              ),
              headerTitleAlign: "center",
              headerShadowVisible: false,
            }}
          />
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
