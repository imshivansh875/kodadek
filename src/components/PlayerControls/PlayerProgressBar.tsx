import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import { trpc } from "~/utils/trpc";

const PlayerProgressBar: Component = () => {
  const [progressMs, setProgressMs] = createSignal(0);
  const nowPlaying = trpc.metadata.nowPlaying.useQuery();

  createEffect(() => {
    if (nowPlaying.data?.progress_ms) {
      setProgressMs(nowPlaying.data.progress_ms);
    }
  });
  

  createEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    if (nowPlaying.data?.is_playing) {
      progressInterval = setInterval(
        () => setProgressMs((current) => current + 1000),
        1000
      );
    }

    onCleanup(() => {
      clearInterval(progressInterval);
    });
  });

  const playingProgress = createMemo(
    () => progressMs() / (nowPlaying.data?.item?.duration_ms || 1)
  );
  

  return (
    <div class="absolute top-0 left-0 w-full group cursor-pointer h-2 -mt-1">
      <div
        class="absolute top-1 left-0 w-full origin-left rounded-r-full"
        style={{ height: "4px", "background-color": "rgba(255,255,255,0.1)" }}
      ></div>
      <div
        class="absolute top-1 left-0 w-full scale-x-0 origin-left bg-cta rounded-r-full shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-transform duration-1000 ease-linear"
        style={{
          height: "4px",
          transform: `scaleX(${playingProgress()})`,
        }}
      ></div>
    </div>
  );
};

export default PlayerProgressBar;
