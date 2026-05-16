import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, type AppTheme } from "@/context/ThemeContext";
import { useSubscription } from "@/lib/revenuecat";

const FEATURES_FREE = [
  { label: "Browse all moments & songs", included: true },
  { label: "Save up to 1 playlist set", included: true },
  { label: "Unlimited playlist sets", included: false },
  { label: "DJ Mode", included: false },
  { label: "Cloud sync across devices", included: false },
  { label: "Export to Spotify / YouTube", included: false },
];

const FEATURES_PRO = [
  { label: "Browse all moments & songs", included: true },
  { label: "Unlimited playlist sets", included: true },
  { label: "DJ Mode", included: true },
  { label: "Cloud sync across devices", included: true },
  { label: "Export to Spotify / YouTube", included: true },
  { label: "Priority support", included: true },
];

type PkgKey = "monthly" | "annual" | "wedding";

const PACKAGE_LOOKUP: Record<PkgKey, string> = {
  monthly: "$rc_monthly",
  annual: "$rc_annual",
  wedding: "$rc_lifetime",
};

const PLAN_INFO: Record<PkgKey, { title: string; badge?: string; description: string }> = {
  monthly: { title: "Pro Monthly", description: "Billed every month. Cancel anytime." },
  annual: { title: "Pro Annual", badge: "Best value", description: "Billed once per year. Save ~30%." },
  wedding: { title: "Wedding Pack", badge: "One-time", description: "Full access until your event date. One-time purchase." },
};

export default function PaywallScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { offerings, isSubscribed, purchase, restore, isPurchasing, isRestoring, isLoading } = useSubscription();

  const [selected, setSelected] = useState<PkgKey>("annual");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmPkg, setConfirmPkg] = useState<any>(null);
  const [confirmLabel, setConfirmLabel] = useState("");

  if (isSubscribed) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.successBox}>
          <Feather name="check-circle" size={48} color={theme.gold} />
          <Text style={styles.successTitle}>You're Pro!</Text>
          <Text style={styles.successSub}>All features are unlocked. Enjoy Mosaic Beats.</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Back to app</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const currentOffering = offerings?.current;

  function getPackage(key: PkgKey) {
    const lookupKey = PACKAGE_LOOKUP[key];
    return currentOffering?.availablePackages.find((p) => p.identifier === lookupKey);
  }

  function priceFor(key: PkgKey) {
    const pkg = getPackage(key);
    return pkg?.product.priceString ?? "—";
  }

  function handleSelectPlan() {
    const pkg = getPackage(selected);
    if (!pkg) return;
    setConfirmPkg(pkg);
    setConfirmLabel(`${PLAN_INFO[selected].title} — ${pkg.product.priceString}`);
    setConfirmVisible(true);
  }

  async function handleConfirmPurchase() {
    setConfirmVisible(false);
    if (!confirmPkg) return;
    try {
      await purchase(confirmPkg);
    } catch (e: any) {
      if (e?.userCancelled) return;
      console.warn("Purchase error:", e);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[`${theme.accent}22`, `${theme.bg}00`]}
        style={styles.topGlow}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={theme.textSecondary} />
          </Pressable>
          <Text style={styles.eyebrow}>Upgrade to Pro</Text>
          <Text style={styles.title}>The full Mosaic Beats{"\n"}experience</Text>
          <Text style={styles.sub}>Music planning for every special moment, without limits.</Text>
        </View>

        <View style={styles.plansRow}>
          {(["monthly", "annual", "wedding"] as PkgKey[]).map((key) => {
            const info = PLAN_INFO[key];
            const price = priceFor(key);
            const active = selected === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSelected(key)}
                style={[styles.planCard, active && { borderColor: theme.accent, borderWidth: 2 }]}
              >
                {info.badge && (
                  <View style={[styles.planBadge, key === "wedding" ? { backgroundColor: theme.gold } : { backgroundColor: theme.accent }]}>
                    <Text style={styles.planBadgeText}>{info.badge}</Text>
                  </View>
                )}
                <Text style={[styles.planTitle, active && { color: theme.accent }]}>{info.title}</Text>
                <Text style={[styles.planPrice, active && { color: theme.text }]}>{isLoading ? "..." : price}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.planDesc}>{PLAN_INFO[selected].description}</Text>

        <View style={styles.featureList}>
          <Text style={styles.featureHeader}>What's included</Text>
          {FEATURES_PRO.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <Feather
                name={f.included ? "check-circle" : "circle"}
                size={16}
                color={f.included ? theme.gold : theme.muted}
              />
              <Text style={[styles.featureText, !f.included && { color: theme.muted }]}>{f.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, { opacity: pressed || isPurchasing ? 0.85 : 1 }]}
          onPress={handleSelectPlan}
          disabled={isPurchasing || isLoading}
        >
          <LinearGradient
            colors={[theme.accent, theme.deepAccent ?? theme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>
                Subscribe — {isLoading ? "..." : priceFor(selected)}
              </Text>
            )}
          </LinearGradient>
        </Pressable>

        <TouchableOpacity
          onPress={async () => { try { await restore(); } catch {} }}
          disabled={isRestoring}
          style={styles.restoreBtn}
        >
          <Text style={styles.restoreText}>
            {isRestoring ? "Restoring..." : "Restore purchases"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm purchase</Text>
            <Text style={styles.modalBody}>{confirmLabel}</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirm} onPress={handleConfirmPurchase}>
                <Text style={styles.modalConfirmText}>Buy now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 220 },
    scroll: { paddingHorizontal: 20, paddingBottom: 24, gap: 20 },
    header: { gap: 8, paddingTop: 12 },
    closeBtn: { alignSelf: "flex-start", marginBottom: 4 },
    eyebrow: { color: t.accent, fontFamily: "Poppins_600SemiBold", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
    title: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 28, letterSpacing: -0.5 },
    sub: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
    plansRow: { flexDirection: "row", gap: 10 },
    planCard: {
      flex: 1, backgroundColor: t.card, borderRadius: 14, padding: 12,
      borderWidth: 1, borderColor: t.border, gap: 4, alignItems: "center",
    },
    planBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 2 },
    planBadgeText: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 10 },
    planTitle: { color: t.textSecondary, fontFamily: "Poppins_600SemiBold", fontSize: 12, textAlign: "center" },
    planPrice: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 14, textAlign: "center" },
    planDesc: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13, textAlign: "center" },
    featureList: { gap: 10, backgroundColor: t.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: t.border },
    featureHeader: { color: t.textSecondary, fontFamily: "Poppins_600SemiBold", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
    featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    featureText: { color: t.text, fontFamily: "Poppins_400Regular", fontSize: 14, flex: 1 },
    footer: { paddingHorizontal: 20, gap: 10, backgroundColor: t.bg, borderTopWidth: 1, borderTopColor: t.border, paddingTop: 12 },
    ctaBtn: { borderRadius: 14, overflow: "hidden" },
    ctaGradient: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
    ctaText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16 },
    restoreBtn: { alignItems: "center", paddingVertical: 4 },
    restoreText: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 13 },
    successBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
    successTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 28 },
    successSub: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 15, textAlign: "center" },
    backBtn: { marginTop: 8, backgroundColor: t.accent, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
    backBtnText: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: "#00000088", alignItems: "center", justifyContent: "center" },
    modalBox: { backgroundColor: t.card, borderRadius: 18, padding: 24, width: 300, gap: 12, borderWidth: 1, borderColor: t.border },
    modalTitle: { color: t.text, fontFamily: "Poppins_700Bold", fontSize: 18 },
    modalBody: { color: t.textSecondary, fontFamily: "Poppins_400Regular", fontSize: 14 },
    modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
    modalCancel: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: t.border, padding: 12, alignItems: "center" },
    modalCancelText: { color: t.textSecondary, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
    modalConfirm: { flex: 1, borderRadius: 10, backgroundColor: t.accent, padding: 12, alignItems: "center" },
    modalConfirmText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },
  });
}
