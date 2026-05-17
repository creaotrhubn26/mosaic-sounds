import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { ClerkProvider } from "@clerk/clerk-expo";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { InteractionManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MiniPlayer } from "@/components/MiniPlayer";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PlaybackProvider } from "@/context/PlaybackContext";
import { warmSearchIndex } from "@/constants/searchIndex";
import { clerkTokenCache } from "@/lib/clerk-token-cache";
import { loadSongOverrides } from "@/lib/song-overrides";
import { initializeRevenueCat, SubscriptionProvider } from "@/lib/revenuecat";

const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must be set");
}

SplashScreen.preventAutoHideAsync();
initializeRevenueCat();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/youtube" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="paywall"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="moment/[id]"
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="set/[id]"
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="set/import"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="template-wizard"
        options={{
          presentation: "card",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      // Pre-warm search index after first paint — O(101) work, done once
      InteractionManager.runAfterInteractions(() => {
        warmSearchIndex();
        // Load YouTube ID overrides (corrects bad/placeholder IDs in the bundled
        // catalog). Hits disk cache instantly, refreshes from server in the
        // background if stale.
        void loadSongOverrides();
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={clerkTokenCache}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AppProvider>
                <SubscriptionProvider>
                  <ThemeProvider>
                    <PlaybackProvider>
                      <RootLayoutNav />
                      <MiniPlayer />
                      <TutorialOverlay />
                    </PlaybackProvider>
                  </ThemeProvider>
                </SubscriptionProvider>
              </AppProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
