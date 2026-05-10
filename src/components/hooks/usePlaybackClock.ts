import {
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";

export function usePlaybackClock(nowPlaying: any) {
  const [playbackMs, setPlaybackMs] =
    createSignal(0);

  createEffect(() => {
    const data = nowPlaying();

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

  return playbackMs;
}