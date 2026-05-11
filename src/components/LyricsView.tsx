import {
  Component,
  For,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";

import { trpc } from "~/utils/trpc";
import PlayerProgressBar from "./PlayerControls/PlayerProgressBar";
import PlayerControls from "./PlayerControls/PlayerControls";
import Screensaver from "./Screensaver";




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
  
  const [localProgress, setLocalProgress] =
  createSignal(0);

  const [currentTrackId, setCurrentTrackId] =
    createSignal("");

  /*
   * Fetch synced lyrics
   */
  createEffect(() => {
  const item =
    nowPlaying.data?.item;

  if (!item) return;

  /*
   * Prevent refetch
   * for same track
   */
  if (
    item.id ===
    currentTrackId()
  ) {
    return;
  }

  /*
   * Track changed
   */
  setCurrentTrackId(item.id);

  /*
   * Reset previous state
   */
  setLyrics([]);
  setActiveLine(0);

  const artist =
    item.artists?.[0]?.name ||
    "";

  const track =
    item.name || "";

  const fetchLyrics =
    async () => {
      try {
        const res =
          await fetch(
            `https://lrclib.net/api/get?artist_name=${encodeURIComponent(
              artist
            )}&track_name=${encodeURIComponent(
              track
            )}`
          );

        const data =
          await res.json();

        if (
          data?.syncedLyrics
        ) {
          setLyrics(
            parseLRC(
              data.syncedLyrics
            )
          );
        } else {
          setLyrics([]);
        }
      } catch {
        setLyrics([]);
      }
    };

  fetchLyrics();
});

  createEffect(() => {
  const spotifyProgress =
    nowPlaying.data?.progress_ms;

  if (
    spotifyProgress !== undefined
  ) {
    setLocalProgress((p) => {
  const drift =
    Math.abs(
      p - spotifyProgress
    );

  /*
   * Only resync if drift large
   */
  return drift > 1500
    ? spotifyProgress
    : p;
});
  }
});

  createEffect(() => {
  const interval = setInterval(() => {
    if (
      nowPlaying.data?.is_playing
    ) {
      setLocalProgress(
        (p) => p + 250
      );
    }
  }, 250);

  onCleanup(() => {
    clearInterval(interval);
  });
});

  /*
   * Refresh Spotify playback
   */
  createEffect(() => {
    const utils = trpc.useContext();

    const refreshTimeout = nowPlaying.data?.is_playing ? 4000 : 12000;

    const interval = setInterval(() => {
      utils.metadata.nowPlaying.invalidate();
    }, refreshTimeout);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  /*
   * Active lyric detection
   */
  createEffect(() => {
    const interval = setInterval(() => {
      const progress = localProgress();

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
    }, 100);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  /*
   * Background image
   */
  const backgroundImage = createMemo(
  () => {
    const item: any =
      nowPlaying.data?.item;

    return (
      item?.album?.images?.[0]
        ?.url || ""
    );
  }
);

  const hasNowPlaying = createMemo(() => {
    return !!nowPlaying.data?.item;
  });

  return (
    <div class="w-full h-full">
      {!hasNowPlaying() ? (
        <Screensaver />
      ) : (
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
      <div class="relative z-10 flex flex-col h-full">
          <div class="pt-8 flex flex-col items-center text-center shrink-0">
            <p class="font-extrabold text-2xl max-w-[520px] leading-tight truncate">
              {nowPlaying.data?.item.name}
            </p>

            <p class="mt-1 opacity-70 text-lg font-bold truncate max-w-[420px]">
              {nowPlaying.data?.item.artists?.[0]?.name}
            </p>
          </div>
        {/* Lyrics */}
        <div class="flex items-center justify-center overflow-hidden px-10 pt-12">
          <div class="relative h-[400px] overflow-hidden w-full">
  

            {/* Lyrics container */}
            <div
              class="flex flex-col items-center transition-transform duration-700 ease-out transform-gpu"
              style={{
                transform: `translateY(calc(165px - ${
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
                          : "font-semibold text-2xl leading-tight"
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
          <PlayerControls isSaved={true} />
        </div>
      </div>
    </div>
    )}
      </div>
  );
};

export default LyricsView;