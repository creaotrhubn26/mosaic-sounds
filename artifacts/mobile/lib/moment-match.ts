import { SONG_DATABASE, type Song } from "@/constants/data";

export type SongMomentCandidate = {
  id?: string;
  title?: string;
  artist?: string;
  energyScore?: number;
  dholScore?: number;
  danceability?: number;
  moments?: string[];
  cultureTags?: string[];
  languageTags?: string[];
  tags?: string[];
};

export type MomentMatchOption = {
  id: string;
  label: string;
  subtitle: string;
  description?: string;
  energyProfile?: string;
};

export type RankedMomentMatch = {
  momentId: string;
  score: number;
  confidence: "high" | "medium" | "low";
  reasons: string[];
};

type FrequencyMap = Record<string, number>;

type MomentProfile = {
  sampleCount: number;
  avgEnergy: number;
  avgDhol: number;
  avgDanceability: number;
  tagFreq: FrequencyMap;
  languageFreq: FrequencyMap;
  cultureFreq: FrequencyMap;
};

const STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "into",
  "your",
  "this",
  "that",
  "night",
  "music",
  "moment",
  "ceremony",
  "wedding",
]);

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
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

function normalizeTagList(values?: string[]): string[] {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.toLowerCase().replace(/_/g, "-").trim())
        .filter(Boolean),
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

function tokenOverlapScore(candidateTokens: string[], momentTokens: string[]): number {
  if (candidateTokens.length === 0 || momentTokens.length === 0) return 35;

  const momentSet = new Set(momentTokens);
  const overlapCount = candidateTokens.filter((token) => momentSet.has(token)).length;
  const denominator = Math.max(1, Math.min(candidateTokens.length, 4));

  if (overlapCount === 0) return 12;

  return clamp(25 + (overlapCount / denominator) * 75);
}

function numericCloseness(value: number | undefined, target: number, stretch = 1): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 50;
  return clamp(100 - Math.abs(value - target) * stretch);
}

function inferTargetsFromMomentText(moment: MomentMatchOption): {
  energy: number;
  dhol: number;
  danceability: number;
  textTokens: string[];
} {
  const textTokens = tokenize(
    moment.label,
    moment.subtitle,
    moment.description,
    moment.energyProfile,
  );

  let energy = 58;
  let dhol = 28;
  let danceability = 58;

  const boostEnergy = (amount: number) => {
    energy = clamp(energy + amount);
    danceability = clamp(danceability + amount * 0.8);
  };

  if (textTokens.some((token) => ["baraat", "afterparty", "party", "entry"].includes(token))) {
    boostEnergy(26);
  }
  if (textTokens.some((token) => ["sangeet", "mehndi", "haldi", "dance", "celebration"].includes(token))) {
    boostEnergy(18);
  }
  if (textTokens.some((token) => ["dinner", "vidaai", "farewell", "ambient"].includes(token))) {
    boostEnergy(-22);
  }
  if (textTokens.some((token) => ["nikah", "pheras", "romantic", "bride", "first"].includes(token))) {
    boostEnergy(-12);
  }

  if (textTokens.some((token) => ["baraat", "dhol", "bhangra", "haldi", "mehndi"].includes(token))) {
    dhol = clamp(dhol + 42);
  }
  if (textTokens.some((token) => ["sangeet", "family", "dance", "entry"].includes(token))) {
    dhol = clamp(dhol + 18);
  }
  if (textTokens.some((token) => ["nikah", "pheras", "dinner", "vidaai", "first"].includes(token))) {
    dhol = clamp(dhol - 16);
  }

  return { energy, dhol, danceability, textTokens };
}

function buildMomentProfiles(): Record<string, MomentProfile> {
  const byMoment = new Map<string, Song[]>();

  SONG_DATABASE.forEach((song) => {
    song.moments.forEach((momentId) => {
      byMoment.set(momentId, [...(byMoment.get(momentId) ?? []), song]);
    });
  });

  return Object.fromEntries(
    Array.from(byMoment.entries()).map(([momentId, songs]) => [
      momentId,
      {
        sampleCount: songs.length,
        avgEnergy: average(songs.map((song) => song.energyScore)),
        avgDhol: average(songs.map((song) => song.dholScore)),
        avgDanceability: average(songs.map((song) => song.danceability)),
        tagFreq: buildFrequencyMap(songs.flatMap((song) => normalizeTagList(song.tags))),
        languageFreq: buildFrequencyMap(
          songs.flatMap((song) => normalizeTagList(song.languageTags)),
        ),
        cultureFreq: buildFrequencyMap(
          songs.flatMap((song) => normalizeTagList(song.cultureTags)),
        ),
      },
    ]),
  );
}

const MOMENT_PROFILES = buildMomentProfiles();

function buildCandidateTokens(candidate: SongMomentCandidate): string[] {
  const normalizedTags = normalizeTagList(candidate.tags);
  const normalizedCultures = normalizeTagList(candidate.cultureTags);
  const normalizedLanguages = normalizeTagList(candidate.languageTags);
  const derivedTokens = [
    ...(candidate.energyScore !== undefined && candidate.energyScore >= 78
      ? ["hype", "party", "dance", "entry"]
      : []),
    ...(candidate.energyScore !== undefined &&
    candidate.energyScore >= 50 &&
    candidate.energyScore < 78
      ? ["celebration", "family"]
      : []),
    ...(candidate.energyScore !== undefined && candidate.energyScore < 50
      ? ["romantic", "chill", "ambient"]
      : []),
    ...(candidate.dholScore !== undefined && candidate.dholScore >= 65
      ? ["dhol", "bhangra", "baraat"]
      : []),
  ];

  return tokenize(
    candidate.title,
    candidate.artist,
    normalizedTags.join(" "),
    normalizedCultures.join(" "),
    normalizedLanguages.join(" "),
    derivedTokens.join(" "),
  );
}

function buildReasons(args: {
  candidate: SongMomentCandidate;
  moment: MomentMatchOption;
  momentTextTokens: string[];
  tagScore: number;
  languageScore: number;
  cultureScore: number;
  energyScore: number;
  dholScore: number;
  hintScore: number;
  candidateTokens: string[];
}): string[] {
  const reasons: string[] = [];
  const normalizedTags = normalizeTagList(args.candidate.tags);
  const normalizedLanguages = normalizeTagList(args.candidate.languageTags);
  const normalizedCultures = normalizeTagList(args.candidate.cultureTags);

  if (args.hintScore >= 100) reasons.push("already tagged for this moment");
  if (args.tagScore >= 55 && normalizedTags.length > 0) {
    reasons.push(`${normalizedTags.slice(0, 2).join(" + ")} fit`);
  }
  if (args.languageScore >= 55 && normalizedLanguages.length > 0) {
    reasons.push(`${normalizedLanguages[0]} language match`);
  }
  if (args.cultureScore >= 55 && normalizedCultures.length > 0) {
    reasons.push(`${normalizedCultures[0]} vibe match`);
  }
  if (args.energyScore >= 70) reasons.push("energy lines up");
  if (args.dholScore >= 70 && (args.candidate.dholScore ?? 0) >= 45) reasons.push("dhol profile fits");
  if (
    reasons.length < 3 &&
    tokenOverlapScore(args.candidateTokens, args.momentTextTokens) >= 45
  ) {
    reasons.push(`fits ${args.moment.label.toLowerCase()} vibe`);
  }

  return reasons.slice(0, 3);
}

function getConfidence(score: number): RankedMomentMatch["confidence"] {
  if (score >= 72) return "high";
  if (score >= 52) return "medium";
  return "low";
}

export function rankMomentsForSongCandidate(
  candidate: SongMomentCandidate,
  moments: MomentMatchOption[],
): RankedMomentMatch[] {
  const normalizedTags = normalizeTagList(candidate.tags);
  const normalizedLanguages = normalizeTagList(candidate.languageTags);
  const normalizedCultures = normalizeTagList(candidate.cultureTags);
  const candidateTokens = buildCandidateTokens(candidate);

  return moments
    .map((moment) => {
      const inferredTargets = inferTargetsFromMomentText(moment);
      const profile = MOMENT_PROFILES[moment.id];

      const tagScore = frequencyMatchScore(normalizedTags, profile?.tagFreq ?? {});
      const languageScore = frequencyMatchScore(
        normalizedLanguages,
        profile?.languageFreq ?? {},
      );
      const cultureScore = frequencyMatchScore(
        normalizedCultures,
        profile?.cultureFreq ?? {},
      );
      const energyScore = numericCloseness(
        candidate.energyScore,
        profile?.avgEnergy ?? inferredTargets.energy,
        1.1,
      );
      const dholScore = numericCloseness(
        candidate.dholScore,
        profile?.avgDhol ?? inferredTargets.dhol,
        1.05,
      );
      const danceScore = numericCloseness(
        candidate.danceability,
        profile?.avgDanceability ?? inferredTargets.danceability,
        1,
      );
      const hintScore = candidate.moments?.includes(moment.id) ? 100 : 0;
      const textScore = tokenOverlapScore(candidateTokens, inferredTargets.textTokens);

      const score =
        tagScore * 0.26 +
        languageScore * 0.12 +
        cultureScore * 0.12 +
        energyScore * 0.16 +
        dholScore * 0.12 +
        danceScore * 0.08 +
        hintScore * 0.1 +
        textScore * 0.04;

      const reasons = buildReasons({
        candidate,
        moment,
        momentTextTokens: inferredTargets.textTokens,
        tagScore,
        languageScore,
        cultureScore,
        energyScore,
        dholScore,
        hintScore,
        candidateTokens,
      });

      return {
        momentId: moment.id,
        score: Math.round(score),
        confidence: getConfidence(score),
        reasons,
      };
    })
    .sort((left, right) => right.score - left.score);
}
