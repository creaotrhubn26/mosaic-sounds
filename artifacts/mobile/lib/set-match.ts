import type { Song } from "@/constants/data";
import type { WeddingSet } from "@/lib/profile-state";
import type { SongMomentCandidate } from "@/lib/moment-match";

export type RankedSetMatch = {
  setId: string;
  score: number;
  confidence: "high" | "medium" | "low";
  reasons: string[];
  alreadyContains: boolean;
};

type FrequencyMap = Record<string, number>;

type SetProfile = {
  avgEnergy: number;
  avgDhol: number;
  avgDanceability: number;
  tagFreq: FrequencyMap;
  languageFreq: FrequencyMap;
  cultureFreq: FrequencyMap;
};

const STOPWORDS = new Set([
  "set",
  "playlist",
  "songs",
  "music",
  "mix",
  "the",
  "and",
  "for",
  "with",
]);

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeTagList(values?: string[]): string[] {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.toLowerCase().replace(/_/g, "-").trim())
        .filter(Boolean),
    ),
  );
}

function tokenize(...parts: Array<string | undefined>): string[] {
  return Array.from(
    new Set(
      parts
        .flatMap((part) =>
          (part ?? "")
            .toLowerCase()
            .replace(/[_/]+/g, " ")
            .split(/[^a-z0-9]+/)
            .map((token) => token.trim())
            .filter((token) => token.length > 1 && !STOPWORDS.has(token)),
        ),
    ),
  );
}

function buildFrequencyMap(values: string[]): FrequencyMap {
  if (values.length === 0) return {};

  const counts: Record<string, number> = {};
  values.forEach((value) => {
    counts[value] = (counts[value] ?? 0) + 1;
  });

  return Object.fromEntries(
    Object.entries(counts).map(([key, count]) => [key, count / values.length]),
  );
}

function frequencyMatchScore(candidateValues: string[], frequencyMap: FrequencyMap): number {
  if (candidateValues.length === 0) return 50;

  const entries = candidateValues.map((value) => frequencyMap[value] ?? 0);
  const maxValue = Math.max(...entries, 0);
  const avgValue = average(entries);

  if (maxValue === 0 && avgValue === 0) return 12;

  return clamp((maxValue * 0.65 + avgValue * 0.35) * 100);
}

function numericCloseness(value: number | undefined, target: number, stretch = 1): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 50;
  return clamp(100 - Math.abs(value - target) * stretch);
}

function overlapRatio(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) return 0;

  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const intersection = left.filter((value) => rightSet.has(value)).length;
  const union = new Set([...leftSet, ...rightSet]).size;

  return union === 0 ? 0 : intersection / union;
}

function tokenOverlapScore(candidateTokens: string[], setTokens: string[]): number {
  if (candidateTokens.length === 0 || setTokens.length === 0) return 35;

  const setTokenSet = new Set(setTokens);
  const overlapCount = candidateTokens.filter((token) => setTokenSet.has(token)).length;
  const denominator = Math.max(1, Math.min(candidateTokens.length, 4));

  if (overlapCount === 0) return 12;

  return clamp(25 + (overlapCount / denominator) * 75);
}

function getConfidence(score: number): RankedSetMatch["confidence"] {
  if (score >= 74) return "high";
  if (score >= 54) return "medium";
  return "low";
}

function buildSetProfile(set: WeddingSet): SetProfile {
  return {
    avgEnergy: average(set.songs.map((song) => song.energyScore)),
    avgDhol: average(set.songs.map((song) => song.dholScore)),
    avgDanceability: average(set.songs.map((song) => song.danceability)),
    tagFreq: buildFrequencyMap(
      set.songs.flatMap((song) => normalizeTagList(song.tags)),
    ),
    languageFreq: buildFrequencyMap(
      set.songs.flatMap((song) => normalizeTagList(song.languageTags)),
    ),
    cultureFreq: buildFrequencyMap(
      set.songs.flatMap((song) => normalizeTagList(song.cultureTags)),
    ),
  };
}

function candidateSongSimilarity(candidate: SongMomentCandidate, song: Song): number {
  const candidateTags = normalizeTagList(candidate.tags);
  const candidateLanguages = normalizeTagList(candidate.languageTags);
  const candidateCultures = normalizeTagList(candidate.cultureTags);
  const songTags = normalizeTagList(song.tags);
  const songLanguages = normalizeTagList(song.languageTags);
  const songCultures = normalizeTagList(song.cultureTags);

  const tagSimilarity = overlapRatio(candidateTags, songTags) * 100;
  const languageSimilarity =
    candidateLanguages.length === 0 ? 50 : overlapRatio(candidateLanguages, songLanguages) * 100;
  const cultureSimilarity =
    candidateCultures.length === 0 ? 50 : overlapRatio(candidateCultures, songCultures) * 100;
  const energySimilarity = numericCloseness(candidate.energyScore, song.energyScore, 1.15);
  const dholSimilarity = numericCloseness(candidate.dholScore, song.dholScore, 1.05);
  const danceSimilarity = numericCloseness(
    candidate.danceability,
    song.danceability,
    1,
  );

  return (
    tagSimilarity * 0.3 +
    languageSimilarity * 0.16 +
    cultureSimilarity * 0.16 +
    energySimilarity * 0.18 +
    dholSimilarity * 0.1 +
    danceSimilarity * 0.1
  );
}

function buildReasons(args: {
  set: WeddingSet;
  candidate: SongMomentCandidate;
  topSongSimilarity: number;
  similarSongCount: number;
  tagScore: number;
  languageScore: number;
  cultureScore: number;
  energyScore: number;
  nameScore: number;
  recencyScore: number;
  alreadyContains: boolean;
}): string[] {
  const reasons: string[] = [];
  const normalizedLanguages = normalizeTagList(args.candidate.languageTags);
  const normalizedCultures = normalizeTagList(args.candidate.cultureTags);
  const normalizedTags = normalizeTagList(args.candidate.tags);

  if (args.alreadyContains) reasons.push("already in this set");
  if (args.similarSongCount >= 2) reasons.push(`matches ${args.similarSongCount} songs already here`);
  else if (args.topSongSimilarity >= 68) reasons.push("closest musical fit");
  if (args.tagScore >= 58 && normalizedTags.length > 0) {
    reasons.push(`${normalizedTags.slice(0, 2).join(" + ")} vibe fits`);
  }
  if (args.languageScore >= 58 && normalizedLanguages.length > 0) {
    reasons.push(`${normalizedLanguages[0]} language mix`);
  }
  if (args.cultureScore >= 58 && normalizedCultures.length > 0) {
    reasons.push(`${normalizedCultures[0]} feel matches`);
  }
  if (args.energyScore >= 72) reasons.push("energy matches the flow");
  if (args.nameScore >= 56) reasons.push("set name lines up");
  if (args.recencyScore >= 84) reasons.push("recently updated");

  return reasons.slice(0, 3);
}

export function rankSetsForSongCandidate(
  candidate: SongMomentCandidate,
  sets: WeddingSet[],
): RankedSetMatch[] {
  const recencyIndex = new Map(
    [...sets]
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
      .map((set, index) => [set.id, index]),
  );

  const candidateTags = normalizeTagList(candidate.tags);
  const candidateLanguages = normalizeTagList(candidate.languageTags);
  const candidateCultures = normalizeTagList(candidate.cultureTags);
  const candidateTokens = tokenize(
    candidate.title,
    candidate.artist,
    candidateTags.join(" "),
    candidateLanguages.join(" "),
    candidateCultures.join(" "),
  );

  return sets
    .map((set) => {
      const alreadyContains = false;
      const profile = buildSetProfile(set);
      const songSimilarities = set.songs
        .map((song) => candidateSongSimilarity(candidate, song))
        .sort((left, right) => right - left);
      const topSongSimilarity = songSimilarities[0] ?? 38;
      const avgTopSongSimilarity = average(songSimilarities.slice(0, 3));
      const similarSongCount = songSimilarities.filter((score) => score >= 66).length;
      const tagScore = frequencyMatchScore(candidateTags, profile.tagFreq);
      const languageScore = frequencyMatchScore(candidateLanguages, profile.languageFreq);
      const cultureScore = frequencyMatchScore(candidateCultures, profile.cultureFreq);
      const energyScore = numericCloseness(candidate.energyScore, profile.avgEnergy || 58, 1.1);
      const dholScore = numericCloseness(candidate.dholScore, profile.avgDhol || 30, 1.05);
      const danceScore = numericCloseness(
        candidate.danceability,
        profile.avgDanceability || 58,
        1,
      );
      const nameScore = tokenOverlapScore(candidateTokens, tokenize(set.name));
      const rankIndex = recencyIndex.get(set.id) ?? sets.length;
      const recencyScore =
        sets.length <= 1 ? 100 : clamp(100 - (rankIndex / (sets.length - 1)) * 50, 50, 100);

      let score =
        topSongSimilarity * 0.24 +
        avgTopSongSimilarity * 0.16 +
        tagScore * 0.14 +
        languageScore * 0.08 +
        cultureScore * 0.08 +
        energyScore * 0.1 +
        dholScore * 0.07 +
        danceScore * 0.05 +
        nameScore * 0.03 +
        recencyScore * 0.05;

      const hasExactSong = set.songs.some((song) => {
        if (candidate.id) return song.id === candidate.id;

        return (
          candidate.title?.trim().toLowerCase() === song.title.trim().toLowerCase() &&
          candidate.artist?.trim().toLowerCase() === song.artist.trim().toLowerCase()
        );
      });

      const finalAlreadyContains = hasExactSong;
      if (finalAlreadyContains) score *= 0.35;

      const roundedScore = Math.round(score);

      return {
        setId: set.id,
        score: roundedScore,
        confidence: getConfidence(roundedScore),
        reasons: buildReasons({
          set,
          candidate,
          topSongSimilarity,
          similarSongCount,
          tagScore,
          languageScore,
          cultureScore,
          energyScore,
          nameScore,
          recencyScore,
          alreadyContains: finalAlreadyContains,
        }),
        alreadyContains: finalAlreadyContains,
      };
    })
    .sort((left, right) => right.score - left.score);
}
