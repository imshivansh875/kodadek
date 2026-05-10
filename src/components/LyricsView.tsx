import {
  Component,
  For,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";

import { trpc } from "~/utils/trpc";

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

const LyricsView: Component = () => {
  const nowPlaying =
    trpc.metadata.nowPlaying.useQuery();

  const [lyrics, setLyrics] =
    createSignal<LyricLine[]>([]);

  const [activeLine, setActiveLine] =
    createSignal(0);

  const [showBeat, setShowBeat] =
    createSignal(false);

  const [currentTrackId, setCurrentTrackId] =
    createSignal("");

  /*
   * Fetch synced lyrics
   */
  createEffect(async () => {
    const item = nowPlaying.data?.item;

    if (!item) return;

    /*
     * Track changed
     */
    if (item.id !== currentTrackId()) {
      setCurrentTrackId(item.id);

      /*
       * Reset old lyrics instantly
       */
      setLyrics([]);
      setActiveLine(0);
    }

    const artist =
      item.artists?.[0]?.name || "";

    const track = item.name || "";

    try {
      const res = await fetch(
        `https://lrclib.net/api/get?artist_name=${encodeURIComponent(
          artist
        )}&track_name=${encodeURIComponent(
          track
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

  /*
   * Refresh Spotify playback
   */
  createEffect(() => {
    const utils = trpc.useContext();

    const interval = setInterval(() => {
      utils.metadata.nowPlaying.invalidate();
    }, 1000);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  /*
   * Active lyric detection
   */
  createEffect(() => {
    const interval = setInterval(() => {
      const progress =
        nowPlaying.data?.progress_ms ?? 0;

      const currentSeconds =
        progress / 1000;

      const lyricArray = lyrics();

      if (!lyricArray.length) return;

      let active = 0;
      let beat = false;

      for (
        let i = 0;
        i < lyricArray.length;
        i++
      ) {
        const current = lyricArray[i];
        const next = lyricArray[i + 1];

        if (
          currentSeconds >= current.time &&
          currentSeconds <
            (next?.time ?? Infinity)
        ) {
          active = i;

          /*
           * Instrumental gap detection
           */
          const gap =
            (next?.time ?? Infinity) -
            current.time;

          const remaining =
            (next?.time ?? Infinity) -
            currentSeconds;

          /*
           * Show music note only
           * during larger gaps
           */
          beat =
            gap > 4 &&
            remaining < gap - 1 &&
            remaining > 1;

          break;
        }
      }

      setShowBeat(beat);
      setActiveLine(active);
    }, 250);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  /*
   * Background image
   */
  const backgroundImage = createMemo(
    () =>
      nowPlaying.data?.item?.album
        ?.images?.[0]?.url || ""
  );

  return (
    <div class="relative w-full h-full overflow-hidden bg-black text-white">
      {/* Background */}
      <div
        class="absolute inset-0 blur-3xl scale-110 opacity-30"
        style={{
          "background-image": `url(${backgroundImage()})`,
          "background-size": "cover",
          "background-position": "center",
        }}
      />

      {/* Main */}
      <div class="relative z-10 flex flex-col items-center justify-center h-full px-10">
        {/* Lyrics */}
<div class="relative h-[360px] overflow-hidden w-full">
  

  {/* Lyrics container */}
  <div
    class="flex flex-col items-center transition-transform duration-700 ease-out transform-gpu"
    style={{
      transform: `translateY(calc(140px - ${
        activeLine() * 74
      }px))`,
    }}
  >
    <For each={lyrics()}>
      {(line, index) => (
        <div
          class={`relative h-[74px] flex items-center justify-center text-center transition-all duration-500 px-8 ${
            index() === activeLine()
              ? "text-white opacity-100 scale-100"
              : "text-white/25 opacity-40 scale-[0.96]"
          }`}
          style={{
            width: "100%",
          }}
        >
          <span
            class={
              index() === activeLine()
                ? "font-black text-4xl leading-tight tracking-tight drop-shadow-[0_0_18px_rgba(255,255,255,0.15)]"
                : "font-bold text-2xl leading-tight"
            }
          >
            {line.text}
          </span>

          {index() === activeLine() &&
            showBeat() && (
              <span class="absolute -bottom-7 text-lg opacity-40 animate-pulse tracking-[6px]">
                ♪ ♪ ♪
              </span>
            )}
        </div>
      )}
    </For>
  </div>
</div>
      </div>
    </div>
  );
};

export default LyricsView;