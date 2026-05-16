import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface StoryCardSong {
  title: string;
  artist: string;
  energyScore: number;
}

interface InstagramStoryCardProps {
  setName: string;
  momentLabel: string;
  coupleNames?: string;
  songs: StoryCardSong[];
  accentColor?: string;
}

const GOLD = "#D4A017";

const InstagramStoryCard = forwardRef<View, InstagramStoryCardProps>(
  ({ setName, momentLabel, coupleNames, songs, accentColor = "#C8102E" }, ref) => {
    const displaySongs = songs.slice(0, 10);
    const avgEnergy =
      songs.length > 0
        ? Math.round(songs.reduce((a, s) => a + s.energyScore, 0) / songs.length)
        : 0;

    const energyLabel =
      avgEnergy >= 70 ? "High Energy" : avgEnergy >= 45 ? "Mid Energy" : "Chill";

    const energyDots = Math.round(avgEnergy / 20);

    return (
      <View ref={ref} style={styles.card} collapsable={false}>
        <LinearGradient
          colors={["#0F0708", "#1A0B0C", `${accentColor}30`, "#0F0708"]}
          locations={[0, 0.35, 0.7, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.accentLine, { backgroundColor: accentColor }]} />

        <View style={styles.inner}>
          <View style={styles.topBrand}>
            <View style={[styles.brandDot, { backgroundColor: accentColor }]} />
            <Text style={styles.brandText}>MOSAIC BEATS</Text>
            <View style={[styles.brandDot, { backgroundColor: accentColor }]} />
          </View>

          <View style={styles.titleBlock}>
            {coupleNames ? (
              <Text style={styles.coupleNames}>{coupleNames}</Text>
            ) : null}
            <Text style={styles.setName} numberOfLines={2}>
              {setName}
            </Text>
            <View style={[styles.momentBadge, { borderColor: `${accentColor}60`, backgroundColor: `${accentColor}18` }]}>
              <Text style={[styles.momentBadgeText, { color: accentColor }]}>
                {momentLabel}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.songList}>
            {displaySongs.map((song, idx) => (
              <View key={idx} style={styles.songRow}>
                <Text style={[styles.songIdx, { color: `${accentColor}80` }]}>
                  {String(idx + 1).padStart(2, "0")}
                </Text>
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle} numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>
                    {song.artist}
                  </Text>
                </View>
                <View
                  style={[
                    styles.energyDot,
                    {
                      backgroundColor:
                        song.energyScore >= 70
                          ? accentColor
                          : song.energyScore >= 45
                          ? GOLD
                          : "#4A4A6A",
                    },
                  ]}
                />
              </View>
            ))}
            {songs.length > 10 && (
              <Text style={styles.moreSongs}>+{songs.length - 10} more songs</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: accentColor }]}>
                {songs.length}
              </Text>
              <Text style={styles.statLabel}>Songs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <View style={styles.energyDotsRow}>
                {[1, 2, 3, 4, 5].map((d) => (
                  <View
                    key={d}
                    style={[
                      styles.energyBarDot,
                      { backgroundColor: d <= energyDots ? accentColor : "#2A1A1C" },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.statLabel}>{energyLabel}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: GOLD }]}>
                ~{Math.round(songs.length * 3.5)}m
              </Text>
              <Text style={styles.statLabel}>Runtime</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerTagline}>
              Multicultural wedding music planning
            </Text>
            <Text style={[styles.footerBrand, { color: accentColor }]}>
              mosaicbeats.app
            </Text>
          </View>
        </View>

        <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
      </View>
    );
  }
);

InstagramStoryCard.displayName = "InstagramStoryCard";
export default InstagramStoryCard;

const styles = StyleSheet.create({
  card: {
    width: 390,
    height: 693,
    backgroundColor: "#0F0708",
    overflow: "hidden",
    flexDirection: "column",
  },
  accentLine: {
    height: 4,
    width: "100%",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 28,
    gap: 20,
    justifyContent: "space-between",
  },
  topBrand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandText: {
    color: "#FAF0E6",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    letterSpacing: 4,
    opacity: 0.9,
  },
  titleBlock: {
    gap: 10,
  },
  coupleNames: {
    color: "#FAF0E680",
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    letterSpacing: 1,
  },
  setName: {
    color: "#FAF0E6",
    fontFamily: "Poppins_700Bold",
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  momentBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  momentBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#FAF0E610",
  },
  songList: {
    gap: 10,
    flex: 1,
    justifyContent: "center",
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  songIdx: {
    fontFamily: "Poppins_700Bold",
    fontSize: 11,
    letterSpacing: 1,
    width: 22,
  },
  songInfo: {
    flex: 1,
    gap: 1,
  },
  songTitle: {
    color: "#FAF0E6",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  songArtist: {
    color: "#FAF0E650",
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
  },
  energyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  moreSongs: {
    color: "#FAF0E640",
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    letterSpacing: -0.5,
  },
  statLabel: {
    color: "#FAF0E650",
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#FAF0E610",
  },
  energyDotsRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  energyBarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    alignItems: "center",
    gap: 2,
  },
  footerTagline: {
    color: "#FAF0E630",
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  footerBrand: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    letterSpacing: 1,
  },
});
