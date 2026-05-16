// Deep link intent handler for Mosaic Beats
// Handles mosaicbeats://set/[id] and mosaicbeats://moment/[id]
// Expo Router resolves file-based routes automatically when scheme = "mosaicbeats"
// This file handles fallback/redirect for unrecognised paths.

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  // Normalise any leading slashes; pass through known routes unchanged
  const cleaned = path.startsWith("/") ? path : `/${path}`;

  // Already a valid Expo Router path — return as-is
  if (
    cleaned.startsWith("/set/") ||
    cleaned.startsWith("/moment/") ||
    cleaned === "/auth/google" ||
    cleaned === "/auth/youtube" ||
    cleaned.startsWith("/(tabs)") ||
    cleaned === "/"
  ) {
    return cleaned;
  }

  // Unknown deep link → fall back to home
  return "/";
}
