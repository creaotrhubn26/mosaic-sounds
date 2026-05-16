import React from "react";
import type { ViewToken } from "react-native";

function readSongId(candidate: unknown): string | null {
  if (!candidate || typeof candidate !== "object") return null;
  const maybeId = (candidate as { id?: unknown }).id;
  return typeof maybeId === "string" && maybeId.trim().length > 0 ? maybeId : null;
}

export function useLazySongThumbnails() {
  const [hydratedSongIds, setHydratedSongIds] = React.useState<Record<string, true>>({});

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setHydratedSongIds((current) => {
        let next = current;
        for (const token of viewableItems) {
          const songId = readSongId(token.item);
          if (!songId || next[songId]) continue;
          if (next === current) next = { ...current };
          next[songId] = true;
        }
        return next;
      });
    },
  ).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 20,
    minimumViewTime: 80,
  }).current;

  return {
    hydratedSongIds,
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
