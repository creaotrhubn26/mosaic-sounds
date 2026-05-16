type AppleSongSearchResult = {
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackName?: string;
  trackTimeMillis?: number;
};

type AppleSongSearchResponse = {
  results?: AppleSongSearchResult[];
};

export type ResolvedSongPreview = {
  previewUrl: string;
  artworkUrl: string | null;
  durationMs: number | null;
  matchedTitle: string | null;
  matchedArtist: string | null;
  confidence: "high" | "medium" | "low";
};

const previewCache = new Map<string, ResolvedSongPreview | null>();

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function buildCacheKey(title: string, artist: string): string {
  return `${normalizeText(title)}::${normalizeText(artist)}`;
}

function getTokenOverlapScore(left: string, right: string): number {
  if (!left || !right) return 0;

  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  const largestSize = Math.max(leftTokens.size, rightTokens.size);
  return Math.round((overlap / largestSize) * 100);
}

function getMatchScore(title: string, artist: string, candidate: AppleSongSearchResult): number {
  if (!candidate.previewUrl) return -1;

  const normalizedTitle = normalizeText(title);
  const normalizedArtist = normalizeText(artist);
  const candidateTitle = normalizeText(candidate.trackName ?? "");
  const candidateArtist = normalizeText(candidate.artistName ?? "");

  let score = 0;

  if (candidateTitle === normalizedTitle) {
    score += 55;
  } else if (
    normalizedTitle &&
    candidateTitle &&
    (candidateTitle.includes(normalizedTitle) || normalizedTitle.includes(candidateTitle))
  ) {
    score += 42;
  } else {
    score += Math.round(getTokenOverlapScore(normalizedTitle, candidateTitle) * 0.45);
  }

  if (normalizedArtist && candidateArtist === normalizedArtist) {
    score += 35;
  } else if (
    normalizedArtist &&
    candidateArtist &&
    (candidateArtist.includes(normalizedArtist) || normalizedArtist.includes(candidateArtist))
  ) {
    score += 24;
  } else {
    score += Math.round(getTokenOverlapScore(normalizedArtist, candidateArtist) * 0.3);
  }

  const combinedCandidate = `${candidateTitle} ${candidateArtist}`.trim();
  const combinedQuery = `${normalizedTitle} ${normalizedArtist}`.trim();
  if (combinedQuery && combinedCandidate && combinedCandidate === combinedQuery) {
    score += 15;
  }

  const hasExplicitVersion = /(remix|live|karaoke|instrumental|sped up|slowed)/.test(normalizedTitle);
  const candidateLooksLikeVariant =
    /(remix|live|karaoke|instrumental|sped up|slowed)/.test(candidateTitle);
  if (!hasExplicitVersion && candidateLooksLikeVariant) {
    score -= 12;
  }

  return score;
}

function toConfidence(score: number): "high" | "medium" | "low" {
  if (score >= 78) return "high";
  if (score >= 56) return "medium";
  return "low";
}

export async function resolveSongPreview(input: {
  title: string;
  artist?: string | null;
}): Promise<ResolvedSongPreview | null> {
  const title = input.title.trim();
  const artist = input.artist?.trim() ?? "";

  if (!title) {
    return null;
  }

  const cacheKey = buildCacheKey(title, artist);
  if (previewCache.has(cacheKey)) {
    return previewCache.get(cacheKey) ?? null;
  }

  const searchParams = new URLSearchParams({
    term: artist ? `${title} ${artist}` : title,
    entity: "song",
    limit: "10",
    country: "us",
  });

  const response = await fetch(`https://itunes.apple.com/search?${searchParams.toString()}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Preview search failed with ${response.status}`);
  }

  const payload = (await response.json()) as AppleSongSearchResponse;
  const bestMatch = (payload.results ?? [])
    .map((candidate) => ({
      candidate,
      score: getMatchScore(title, artist, candidate),
    }))
    .filter((result) => result.score >= 38)
    .sort((left, right) => right.score - left.score)[0];

  if (!bestMatch?.candidate.previewUrl) {
    previewCache.set(cacheKey, null);
    return null;
  }

  const resolved: ResolvedSongPreview = {
    previewUrl: bestMatch.candidate.previewUrl,
    artworkUrl: bestMatch.candidate.artworkUrl100 ?? null,
    durationMs:
      typeof bestMatch.candidate.trackTimeMillis === "number"
        ? bestMatch.candidate.trackTimeMillis
        : null,
    matchedTitle: bestMatch.candidate.trackName ?? null,
    matchedArtist: bestMatch.candidate.artistName ?? null,
    confidence: toConfidence(bestMatch.score),
  };

  previewCache.set(cacheKey, resolved);
  return resolved;
}
