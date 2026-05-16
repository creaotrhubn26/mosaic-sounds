import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

let WebView: any = null;
try {
  WebView = require("react-native-webview").WebView;
} catch {}

type Props = {
  visible: boolean;
  videoId: string | null;
  title?: string;
  onClose: () => void;
};

export default function YouTubePlayerModal({ visible, videoId, title, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: "#000000" }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Feather name="x" size={22} color="#FFFFFF" />
          </Pressable>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        {/* Player */}
        {WebView && embedUrl && Platform.OS !== "web" ? (
          <WebView
            source={{ uri: embedUrl }}
            style={styles.player}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <Feather name="youtube" size={48} color="#C8102E" />
                <Text style={styles.loadingText}>Loading…</Text>
              </View>
            )}
          />
        ) : embedUrl ? (
          // Web fallback — use iframe
          <View style={styles.iframeWrap}>
            {/* @ts-ignore */}
            <iframe
              src={embedUrl}
              style={{ width: "100%", height: "100%", border: "none", borderRadius: 0 }}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </View>
        ) : (
          <View style={styles.loadingOverlay}>
            <Feather name="youtube" size={48} color="#C8102E" />
            <Text style={styles.loadingText}>No video available</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: "#000000",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FAF0E6",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    flex: 1,
  },
  player: {
    flex: 1,
    backgroundColor: "#000000",
  },
  iframeWrap: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#000000",
  },
  loadingText: {
    color: "#FAF0E6",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
});
