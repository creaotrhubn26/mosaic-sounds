import { SONG_DATABASE, SONG_META } from "./data";
import type { Song } from "./data";

export type IndexedSong = {
  song: Song;
  normalized: string;
  decade: string;
};

// Built once at module-load time — O(n) upfront, O(1) per query thereafter
let _index: IndexedSong[] | null = null;

function decadeForYear(year: number): string {
  const d = Math.floor(year / 10) * 10;
  if (d <= 1979) return "70s";
  if (d === 1980) return "80s";
  if (d === 1990) return "90s";
  if (d === 2000) return "2000s";
  if (d === 2010) return "2010s";
  return "2020s";
}

export function getSearchIndex(): IndexedSong[] {
  if (_index) return _index;
  _index = SONG_DATABASE.map((song) => {
    const meta = SONG_META[song.id];
    const year = meta?.year ?? 2018;
    const normalized = [
      song.title,
      song.artist,
      ...song.tags,
      ...(song.languageTags ?? []),
      ...(song.cultureTags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return { song, normalized, decade: decadeForYear(year) };
  });
  return _index;
}

export function warmSearchIndex(): void {
  getSearchIndex();
}
