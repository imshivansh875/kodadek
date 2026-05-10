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

  const [lyrics, setLyrics] = createSignal<LyricLine[]>([]);
  const [showBeat, setShowBeat] = createSignal(false);
  const [lastLine, setLastLine] = createSignal(-1);

  const [activeLine, setActiveLine] =
    createSignal(0);

  const [playbackMs, setPlaybackMs] =
    createSignal(0);

  /*
   * Fetch synced lyrics
   */
  createEffect(async () => {
    const item = nowPlaying.data?.item;

    if (!item) return;

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
   * Refresh playback
   */
  createEffect(() => {
    const utils = trpc.useContext();

    const interval = setInterval(() => {
      utils.metadata.nowPlaying.invalidate();
    }, 8000);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  createEffect(() => {
  const currentSeconds =
    playbackMs() / 1000;

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

      const remaining =
        (next?.time ?? Infinity) -
        currentSeconds;

      beat =
        remaining < 1.2 &&
        remaining > 0.15;

      break;
    }
  }

  /*
   * ONLY update when line changes
   */
  if (active !== lastLine()) {
    setLastLine(active);
    setActiveLine(active);
  }

  setShowBeat(beat);
});

  let raf: number;

    createEffect(() => {
        const data = nowPlaying.data;

        if (!data?.is_playing) return;

    /*
   * Sync only if drift is large
   */
  const estimated =
    playbackMs();

  const spotifyProgress =
    data.progress_ms ?? 0;

  const drift = Math.abs(
    estimated - spotifyProgress
  );

  /*
   * Prevent tiny reset jumps
   */
  if (drift > 1500) {
    setPlaybackMs(spotifyProgress);
  }

  const startedAt =
    Date.now() - playbackMs();

  const tick = () => {
    setPlaybackMs(
      Date.now() - startedAt
    );

    raf = requestAnimationFrame(tick);
  };

  cancelAnimationFrame(raf);

  tick();
});

onCleanup(() => {
  cancelAnimationFrame(raf);
});

    createEffect(() => {
  const currentSeconds =
    playbackMs() / 1000;

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
       * Gap detection
       */
      const remaining =
        (next?.time ?? Infinity) -
        currentSeconds;

      /*
       * Show beat note
       * near end of lyric
       */
      beat =
        remaining < 1.2 &&
        remaining > 0.15;

      break;
    }
  }

  setShowBeat(beat);
  setActiveLine(active);
});


  /*
   * Background
   */
  const backgroundImage = createMemo(
    () =>
      nowPlaying.data?.item?.album
        ?.images?.[0]?.url || ""
  );

  return (
    <div class="relative w-screen h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <div
        class="absolute inset-0 blur-3xl scale-110 opacity-30"
        style={{
          "background-image": `url(${backgroundImage()})`,
          "background-size": "cover",
          "background-position": "center",
        }}
      />

      {/* Overlay */}
      <div class="absolute inset-0 bg-black/40" />

      {/* Main */}
      <div class="relative z-10 flex flex-col items-center justify-center h-full px-10">
        {/* Lyrics */}
        <div class="relative h-[420px] overflow-hidden w-full max-w-5xl">
          {/* Top fade */}
          <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />

          {/* Bottom fade */}
          <div class="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />

          <div
            class="flex flex-col items-center transition-transform duration-500 ease-out transform-gpu will-change-transform"
            style={{
              transform: `translateY(calc(180px - ${
                activeLine() * 72
              }px))`,
            }}
          >
            <For each={lyrics()}>
              {(line, index) => (
                <div
                  class={`h-[72px] flex items-center justify-center text-center transition-all duration-300 px-8 ${
                    index() === activeLine()
                      ? "text-white text-5xl font-extrabold opacity-100 scale-105"
                      : "text-white/30 text-3xl font-bold opacity-60"
                  }`}
                  style={{
                    width: "100%",
                  }}
                >
                    <div class="relative flex flex-col items-center justify-center h-[72px]">
                        <span>
                            {line.text}
                        </span>
                        {index() === activeLine() &&
                        showBeat() && (
                            <span class="absolute -bottom-3 text-xl opacity-60 animate-pulse">
                                ♪ ♪ ♪
                            </span>
                            )}
                    </div>
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