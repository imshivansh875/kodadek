import {
  createEffect,
  createSignal,
} from "solid-js";

interface LyricLine {
  time: number;
  text: string;
}

function parseLRC(
  lrc: string
): LyricLine[] {
  return lrc
    .split("\n")
    .map((line) => {
      const match = line.match(
        /\[(\d+):(\d+\.\d+)\](.*)/
      );

      if (!match) return null;

      return {
        time:
          Number(match[1]) * 60 +
          Number(match[2]),
        text: match[3].trim(),
      };
    })
    .filter(
      (
        line
      ): line is LyricLine =>
        line !== null
    );
}

export function useLyrics(
  artist: () => string,
  track: () => string
) {
  const [lyrics, setLyrics] =
    createSignal<LyricLine[]>([]);

  createEffect(async () => {
    if (!artist() || !track()) return;

    try {
      const res = await fetch(
        `https://lrclib.net/api/get?artist_name=${encodeURIComponent(
          artist()
        )}&track_name=${encodeURIComponent(
          track()
        )}`
      );

      const data = await res.json();

      if (data?.syncedLyrics) {
        setLyrics(
          parseLRC(data.syncedLyrics)
        );
      } else {
        setLyrics([]);
      }
    } catch {
      setLyrics([]);
    }
  });

  return lyrics;
}