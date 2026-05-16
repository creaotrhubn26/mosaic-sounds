import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
  accentColor?: string;
};

export function EmptyState({ icon, title, subtitle, action, accentColor }: Props) {
  const theme = useTheme();
  const color = accentColor ?? theme.accent;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={[styles.iconRing, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
        <Feather name={icon as any} size={32} color={color} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      {action ? (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}
          onPress={action.onPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionText, { color }]}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 14 },
  iconRing: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", borderWidth: 1.5, marginBottom: 4 },
  title: { fontFamily: "Poppins_600SemiBold", fontSize: 17, textAlign: "center", lineHeight: 24 },
  subtitle: { fontFamily: "Poppins_400Regular", fontSize: 13, textAlign: "center", lineHeight: 20 },
  actionBtn: { marginTop: 4, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99, borderWidth: 1 },
  actionText: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
});
