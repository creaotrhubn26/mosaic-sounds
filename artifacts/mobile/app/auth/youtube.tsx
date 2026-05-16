import { useEffect, useMemo } from "react";
import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { publishWebAuthResult } from "@/lib/web-auth-bridge";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

WebBrowser.maybeCompleteAuthSession();

export default function YouTubeAuthScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const url = window.location.href;
    const callbackUrl = new URL(url);
    const isSuccessfulConnection = callbackUrl.searchParams.get("connected") === "1";

    publishWebAuthResult("youtube", url);

    if (window.opener && window.opener !== window) {
      window.close();
      return;
    }

    if (isSuccessfulConnection) {
      window.location.replace("/");
    }
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.gold} size="small" />
      <Text style={styles.title}>Finishing YouTube connection</Text>
      <Text style={styles.copy}>You can return to Mosaic Beats if this page does not close automatically.</Text>
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 24,
      backgroundColor: t.bg,
    },
    title: {
      color: t.text,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
      textAlign: "center",
    },
    copy: {
      color: t.textSecondary,
      fontFamily: "Poppins_400Regular",
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
    },
  });
}
