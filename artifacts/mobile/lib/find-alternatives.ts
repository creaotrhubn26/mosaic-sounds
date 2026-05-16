import { SONG_DATABASE } from "@/constants/data";
import type { Song } from "@/constants/data";

let _extendedSongs: Song[] = [];
try {
  const ext = require("@/constants/data-extended");
  _extendedSongs = ext.EXTENDED_SONGS ?? ext.default ?? [];
} catch {}

export function getAllSongs(): Song[] {
  return [...SONG_DATABASE, ..._extendedSongs];
}

export type AlternativeResult = {
  song: Song;
  score: number;
  matchReasons: string[];
};

export function findAlternatives(
  song: Song,
  options: {
    excludeIds?: string[];
    count?: number;
  } = {}
): AlternativeResult[] {
  const { excludeIds = [], count = 5 } = options;
  const excludeSet = new Set([song.id, ...excludeIds]);

  return getAllSongs()
    .filter((s) => !excludeSet.has(s.id))
    .map((s) => {
      const reasons: string[] = [];
      let score = 0;

      const momentOverlap = song.moments.filter((m) => s.moments.includes(m));
      if (momentOverlap.length > 0) {
        score += momentOverlap.length * 30;
        reasons.push(`Same moment${momentOverlap.length > 1 ? "s" : ""}`);
      }

      const cultureOverlap = song.cultureTags.filter((c) =>
        s.cultureTags.includes(c)
      );
      if (cultureOverlap.length > 0) {
        score += cultureOverlap.length * 20;
        reasons.push(`Matching culture`);
      }

      const energyDiff = Math.abs(s.energyScore - song.energyScore);
      const energyBonus = Math.max(0, 40 - energyDiff);
      score += energyBonus;
      if (energyDiff <= 10) reasons.push("Similar energy");

      const langOverlap = song.languageTags.filter((l) =>
        s.languageTags.includes(l)
      );
      if (langOverlap.length > 0) {
        score += langOverlap.length * 15;
        reasons.push("Same language");
      }

      if (s.familyFriendly === song.familyFriendly) {
        score += 10;
        if (song.familyFriendly) reasons.push("Family friendly");
      }

      const dholDiff = Math.abs(s.dholScore - song.dholScore);
      if (dholDiff <= 15) {
        score += 8;
        if (song.dholScore > 60) reasons.push("Dhol-heavy match");
      }

      if (score === 0) score = Math.max(1, energyBonus);

      return { song: s, score, matchReasons: reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
