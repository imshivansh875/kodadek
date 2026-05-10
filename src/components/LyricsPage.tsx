import {
  Component,
  For,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";

interface LyricsPageProps {
  nowPlaying: any;
}

function parseLRC(lrc: string) {
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
    .filter(Boolean) as {
    time: number;
    text: string;
  }[];
}

const LyricsPage: Component<
  LyricsPageProps
> = (props) => {
  const [lyrics, setLyrics] = createSignal<
    { time: number; text: string }[]
  >([]);

  const [activeLine, setActiveLine] =
    createSignal(0);

  const [playbackMs, setPlaybackMs] =
    createSignal(0);

  /*
   * Fetch synced lyrics
   */
  createEffect(async () => {
    const item = props.nowPlaying?.item;

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
   * Smooth playback clock
   */
  createEffect(() => {
    const data = props.nowPlaying;

    if (!data?.is_playing) return;

    const baseProgress =
      data.progress_ms ?? 0;

    const startedAt = Date.now();

    let raf: number;

    const tick = () => {
      const elapsed =
        Date.now() - startedAt;

      setPlaybackMs(
        baseProgress + elapsed
      );

      raf = requestAnimationFrame(tick);
    };

    tick();

    onCleanup(() => {
      cancelAnimationFrame(raf);
    });
  });

  /*
   * Active lyric detection
   */
  createEffect(() => {
    const currentSeconds =
      playbackMs() / 1000;

    const lyricArray = lyrics();

    if (!lyricArray.length) return;

    let active = 0;

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
        break;
      }
    }

    setActiveLine(active);
  });

  /*
   * Background image
   */
  const backgroundImage = createMemo(
    () =>
      props.nowPlaying?.item?.album
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

      {/* Dark overlay */}
      <div class="absolute inset-0 bg-black/40" />

      {/* Main content */}
      <div class="relative z-10 flex flex-col items-center justify-center h-full px-10">
        {/* Song info */}
        <div class="mb-16 text-center">
          <p class="text-5xl font-extrabold">
            {props.nowPlaying?.item?.name}
          </p>

          <p class="mt-3 text-2xl opacity-70 font-semibold">
            {props.nowPlaying?.item?.artists
              ?.map((a: any) => a.name)
              .join(", ")}
          </p>
        </div>

        {/* Lyrics */}
        <div class="relative h-[420px] overflow-hidden w-full max-w-5xl">
          {/* Top fade */}
          <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />

          {/* Bottom fade */}
          <div class="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />

          <div
            class="flex flex-col items-center transition-transform duration-500 ease-out"
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
                  {line.text}
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsPage;