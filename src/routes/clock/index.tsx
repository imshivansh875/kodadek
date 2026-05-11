import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";

const CARD_WIDTH = 720;
const CARD_HEIGHT = 720;

const LiveClockWidget: Component = () => {
  const [time, setTime] =
    createSignal("");

  const [date, setDate] =
    createSignal("");

  createEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }
        )
      );

      setDate(
        now.toLocaleDateString(
          "en-IN",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      );
    };

    updateClock();

    const interval = setInterval(
      updateClock,
      1000
    );

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  return (
    <div class="flex items-center justify-center w-screen h-screen bg-black overflow-hidden">
      {/* Resolution Container */}
      <div
        class="relative overflow-hidden rounded-[36px] shadow-2xl"
        style={{
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          transform: "translateZ(0)",
        }}
      >
        {/* Background */}
        <div class="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />

        {/* Ambient Glow */}
        <div class="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/10 blur-[140px]" />

        <div class="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-[140px]" />

        {/* Grid Glow */}
        <div
          class="absolute inset-0 opacity-[0.04]"
          style={{
            background:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            "background-size": "60px 60px",
          }}
        />

        {/* Main Clock */}
        <div class="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-12">
          {/* Time */}
          <h1 class="text-[120px] leading-none font-black tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            {time()}
          </h1>

          {/* Date */}
          <p class="mt-6 text-3xl font-semibold text-white/65 tracking-wide">
            {date()}
          </p>

          {/* Live Indicator */}
          <div class="mt-10 inline-flex items-center gap-3 rounded-full px-6 py-3 bg-white/10 border border-white/10 backdrop-blur-xl">
            <div class="w-3 h-3 rounded-full bg-green-400 animate-pulse" />

            <span class="text-lg font-bold tracking-[3px] text-white/80">
              LIVE • IST
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClockWidget;