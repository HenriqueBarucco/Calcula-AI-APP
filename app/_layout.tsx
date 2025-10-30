import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "../context/SessionContext";
import { colors, typography } from "../styles/theme";

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
  <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SessionProvider>
          <Stack
            screenOptions={{
              headerTitle: () => <Text style={styles.headerTitle}>Calcula AI</Text>,
              headerTitleAlign: "center",
              headerShadowVisible: false,
              headerTintColor: colors.text,
            }}
          />
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "SpaceMono",
    fontSize: typography.subtitle,
    letterSpacing: 0.5,
    color: colors.text,
  },
});
