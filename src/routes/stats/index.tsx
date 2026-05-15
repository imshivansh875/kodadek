import { Component, createSignal, onCleanup, createEffect } from "solid-js";

const GamerStats: Component = () => {
  const [cpu, setCpu] = createSignal(42);
  const [gpu, setGpu] = createSignal(65);
  const [ram, setRam] = createSignal(16.4);
  const [fps, setFps] = createSignal(144);

  // Simulate live stats
  createEffect(() => {
    const interval = setInterval(() => {
      setCpu(c => Math.min(100, Math.max(0, Math.round(c + (Math.random() * 10 - 5)))));
      setGpu(g => Math.min(95, Math.max(30, Math.round(g + (Math.random() * 4 - 2)))));
      setFps(f => Math.min(240, Math.max(60, Math.round(f + (Math.random() * 8 - 4)))));
    }, 1000);
    onCleanup(() => clearInterval(interval));
  });

  return (
    <div class="flex items-center justify-center w-screen h-screen bg-black overflow-hidden font-sans">
      <div class="relative w-[720px] h-[720px] rounded-[36px] bg-gradient-to-br from-indigo-950 via-zinc-900 to-black shadow-2xl overflow-hidden flex flex-col p-10 text-white">

        {/* Ambient Glows */}
        <div class="absolute -top-32 -right-32 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div class="relative w-full text-center mb-8">
          <h2 class="text-4xl font-heading tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm uppercase">System Stats</h2>
        </div>

        <div class="relative grid grid-cols-2 gap-8 w-full h-full">
          {/* CPU Widget */}
          <div class="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between hover:bg-white/10 transition-colors">
            <p class="text-white/50 tracking-widest uppercase font-bold">CPU Usage</p>
            <div class="flex items-end gap-2">
              <span class="text-7xl font-heading drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]">{cpu()}</span>
              <span class="text-2xl font-bold text-white/50 pb-2">%</span>
            </div>
            <div class="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
              <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${cpu()}%` }}></div>
            </div>
          </div>

          {/* GPU Widget */}
          <div class="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between hover:bg-white/10 transition-colors">
            <p class="text-white/50 tracking-widest uppercase font-bold">GPU Temp</p>
            <div class="flex items-end gap-2">
              <span class="text-7xl font-heading drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">{gpu()}</span>
              <span class="text-2xl font-bold text-white/50 pb-2">°C</span>
            </div>
            <div class="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
              <div class="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${gpu()}%` }}></div>
            </div>
          </div>

          {/* RAM Widget */}
          <div class="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between hover:bg-white/10 transition-colors">
            <p class="text-white/50 tracking-widest uppercase font-bold">Memory</p>
            <div class="flex items-end gap-2">
              <span class="text-7xl font-heading text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">{ram()}</span>
              <span class="text-2xl font-bold text-white/50 pb-2">GB</span>
            </div>
            <p class="text-white/40 text-sm mt-2">16.4 / 32.0 GB used</p>
          </div>

          {/* FPS Widget */}
          <div class="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between hover:bg-white/10 transition-colors">
            <p class="text-white/50 tracking-widest uppercase font-bold">Current FPS</p>
            <div class="flex items-end gap-2">
              <span class="text-7xl font-heading text-cta drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">{fps()}</span>
            </div>
            <p class="text-cta/80 font-semibold mt-2 animate-pulse">Smooth Performance</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GamerStats;
