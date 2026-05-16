import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { WeddingMoment } from "@/constants/data";
import { getMomentImage } from "@/constants/images";
import { useTheme, type AppTheme } from "@/context/ThemeContext";

type Props = {
  moment: WeddingMoment;
  onPress: (moment: WeddingMoment) => void;
  songCount?: number;
  selected?: boolean;
  loadImage?: boolean;
  compact?: boolean;
  cardAspectRatio?: number;
};

export function MomentCard({
  moment,
  onPress,
  songCount,
  selected,
  loadImage = true,
  compact = false,
  cardAspectRatio = 1,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme, compact), [theme, compact]);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20 });
  };

  const image = getMomentImage(moment.id) ?? undefined;
  const shouldLoadImage = !!image && loadImage;

  return (
    <Animated.View style={[animatedStyle, styles.wrapper, { aspectRatio: cardAspectRatio }]}>
      <Pressable
        onPress={() => onPress(moment)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, selected && styles.cardSelected]}
      >
        {shouldLoadImage ? (
          <Image
            source={image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="low"
            recyclingKey={moment.id}
            transition={200}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.imagePlaceholder]} />
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.0)", "rgba(10,4,5,0.82)"]}
          locations={[0, 0.45, 1]}
          style={styles.overlay}
        >
          {songCount !== undefined && songCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{songCount}</Text>
            </View>
          )}

          <View style={styles.textArea}>
            <Text style={styles.label} numberOfLines={compact ? 2 : 1}>{moment.label}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{moment.subtitle}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function makeStyles(t: AppTheme, compact: boolean) {
  return StyleSheet.create({
    wrapper: {
      width: "100%",
      aspectRatio: 1,
    },
    card: {
      flex: 1,
      position: "relative",
      borderRadius: compact ? 14 : 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(212,160,23,0.22)",
    },
    cardSelected: {
      borderColor: t.gold,
      borderWidth: 2,
    },
    imagePlaceholder: {
      backgroundColor: `${t.card}F2`,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      padding: compact ? 8 : 11,
      justifyContent: "flex-end",
    },
    textArea: {
      gap: compact ? 1 : 2,
    },
    label: {
      color: "#FFFFFF",
      fontFamily: "Poppins_700Bold",
      fontSize: compact ? 12 : 14,
      lineHeight: compact ? 16 : 19,
      textShadowColor: "rgba(0,0,0,0.8)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    subtitle: {
      color: "rgba(255,235,180,0.85)",
      fontFamily: "Poppins_500Medium",
      fontSize: compact ? 9 : 10,
      lineHeight: compact ? 12 : 14,
      textShadowColor: "rgba(0,0,0,0.6)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    badge: {
      position: "absolute",
      top: compact ? 7 : 10,
      right: compact ? 7 : 10,
      backgroundColor: t.gold,
      borderRadius: 10,
      minWidth: compact ? 18 : 22,
      height: compact ? 18 : 22,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: compact ? 4 : 6,
    },
    badgeText: {
      color: t.bg,
      fontFamily: "Poppins_700Bold",
      fontSize: compact ? 9 : 11,
    },
  });
}
