import React from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const GOOGLE_G_LOGO = require("@/assets/images/google-g-logo.png");

type GoogleBrandMarkProps = {
  framed?: boolean;
  size?: number;
};

type GoogleSignInButtonProps = {
  busy?: boolean;
  busyLabel?: string;
  disabled?: boolean;
  label?: string;
  onPress: () => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
};

export function GoogleBrandMark({ framed = false, size = 18 }: GoogleBrandMarkProps) {
  return (
    <View style={[styles.markWrap, framed && styles.markWrapFramed]}>
      <Image source={GOOGLE_G_LOGO} style={{ width: size, height: size }} resizeMode="contain" />
    </View>
  );
}

export function GoogleSignInButton({
  busy = false,
  busyLabel = "Connecting...",
  disabled = false,
  label = "Continue with Google",
  onPress,
  style,
}: GoogleSignInButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        (pressed || busy || disabled) && styles.buttonPressed,
        style,
      ]}
    >
      <GoogleBrandMark size={18} />
      <Text style={styles.buttonText}>{busy ? busyLabel : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#747775",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonPressed: {
    opacity: 0.84,
  },
  buttonText: {
    color: "#1F1F1F",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.select({
      android: "Roboto",
      web: "Roboto, Arial, sans-serif",
      default: undefined,
    }),
  },
  markWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  markWrapFramed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
});
