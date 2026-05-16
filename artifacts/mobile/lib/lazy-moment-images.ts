import React from "react";
import type { ViewToken } from "react-native";
import { Image } from "expo-image";
import { getMomentImage } from "@/constants/images";
import { WEDDING_MOMENTS, BIRTHDAY_MOMENTS, CORPORATE_MOMENTS, PARTY_MOMENTS } from "@/constants/data";

// Collect all unique moment IDs across every event type
const ALL_MOMENT_IDS = Array.from(
  new Set([
    ...WEDDING_MOMENTS,
    ...BIRTHDAY_MOMENTS,
    ...CORPORATE_MOMENTS,
    ...PARTY_MOMENTS,
  ].map(m => m.id))
);

// Prefetch all moment images on import so they are ready immediately.
// getMomentImage() returns Metro require() asset refs (typed as {}), but expo-image
// accepts them at runtime — cast through unknown to satisfy the string[] param.
const ALL_MOMENT_URIS = ALL_MOMENT_IDS.flatMap((id) => {
  const src = getMomentImage(id);
  return src ? [src] : [];
});

if (ALL_MOMENT_URIS.length > 0) {
  Image.prefetch(ALL_MOMENT_URIS as unknown as string[], "disk").catch(() => {});
}

function readItemId(candidate: unknown): string | null {
  if (!candidate || typeof candidate !== "object") return null;
  const maybeId = (candidate as { id?: unknown }).id;
  return typeof maybeId === "string" && maybeId.trim().length > 0 ? maybeId : null;
}

export function useLazyMomentImages() {
  // Pre-hydrate all known IDs so every moment card shows its image immediately
  const [hydratedMomentIds, setHydratedMomentIds] = React.useState<Record<string, true>>(
    () => {
      const initial: Record<string, true> = {};
      ALL_MOMENT_IDS.forEach((id) => { initial[id] = true; });
      return initial;
    }
  );

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setHydratedMomentIds((current) => {
        let next = current;
        for (const token of viewableItems) {
          const itemId = readItemId(token.item);
          if (!itemId || next[itemId]) continue;
          if (next === current) next = { ...current };
          next[itemId] = true;
        }
        return next;
      });
    },
  ).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 5,
    minimumViewTime: 0,
  }).current;

  return {
    hydratedMomentIds,
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
