import { Component, createSignal, onCleanup, createEffect, onMount } from "solid-js";
import { Navigation as NavIcon, MapPin, CornerUpRight, AlertTriangle } from "lucide-solid";

const CarDashboard: Component = () => {
  const [speed, setSpeed] = createSignal(0);
  const [rpm, setRpm] = createSignal(0); // Requires OBD-II scanner integration for real data
  const [locationName, setLocationName] = createSignal("Locating...");
  const [lat, setLat] = createSignal(37.7749);
  const [lon, setLon] = createSignal(-122.4194);
  const [geoError, setGeoError] = createSignal("");

  // Fetch real street name using OpenStreetMap Nominatim API
  const fetchLocationName = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      if (data && data.address) {
        const place = data.address.road || data.address.city || data.address.town || data.address.village || "Unknown Road";
        setLocationName(place);
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    }
  };

  onMount(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGeoError("");
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);

        // Convert m/s to km/h, default to 0 if null (common on stationary devices)
        const currentSpeed = position.coords.speed ? position.coords.speed * 3.6 : 0;
        setSpeed(currentSpeed);

        // Fetch the street name only if moved significantly (avoid rate limits)
        fetchLocationName(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setGeoError(error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    onCleanup(() => navigator.geolocation.clearWatch(watchId));
  });

  return (
    <div class="flex items-center justify-center w-screen h-screen bg-black overflow-hidden font-sans">
      <div class="relative w-[720px] h-[720px] rounded-[36px] bg-zinc-900 shadow-2xl overflow-hidden text-white border border-white/10">

        {/* Fullscreen Map Background (Real Dynamic Bounds) */}
        <div class="absolute inset-0 pointer-events-none opacity-80" style={{ filter: "invert(100%) hue-rotate(180deg) brightness(85%) contrast(120%)" }}>
          <iframe
            width="100%"
            height="100%"
            frameborder="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon() - 0.005}%2C${lat() - 0.005}%2C${lon() + 0.005}%2C${lat() + 0.005}&layer=mapnik&marker=${lat()}%2C${lon()}`}
          />
        </div>

        {/* Ambient Gradient Overlay for readibility */}
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>

        {/* Top Navigation Bar Overlays */}
        <div class="absolute top-8 left-8 right-8 flex justify-between items-start">

          {/* Next Turn Widget (Requires routing API like Mapbox for real instructions) */}
          <div class="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-lg">
            <div class="w-14 h-14 bg-cta rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.6)]">
              <NavIcon size={32} class="text-white" strokeWidth={3} />
            </div>
            <div>
              <p class="text-white/60 font-bold uppercase tracking-wider text-xs">Navigation Mode</p>
              <div class="flex items-baseline gap-2">
                <p class="text-2xl font-heading text-white">{geoError() ? "GPS Error" : "Active"}</p>
              </div>
            </div>
          </div>

          {/* Current Location Pill */}
          <div class="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full shadow-lg max-w-[200px]">
            {geoError() ? (
              <AlertTriangle size={20} class="text-orange-400 flex-shrink-0" />
            ) : (
              <MapPin size={20} class="text-red-400 flex-shrink-0" />
            )}
            <p class="font-bold text-sm tracking-wide text-white/90 truncate">{geoError() || locationName()}</p>
          </div>
        </div>

        {/* Bottom Floating Stats Dashboard */}
        <div class="absolute bottom-8 left-8 right-8 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-2xl flex items-center justify-between">

          {/* Left Stats: Temp & Drive Mode */}
          <div class="flex flex-col gap-6 w-1/4">
            <div>
              <p class="text-white/40 tracking-widest uppercase text-xs font-bold mb-1">Status</p>
              <p class="text-xl font-heading text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">LIVE GPS</p>
            </div>
            <div>
              <p class="text-white/40 tracking-widest uppercase text-xs font-bold mb-1">Temp (Mock)</p>
              <p class="text-xl font-heading">24°C</p>
            </div>
          </div>

          {/* Center: Real Digital Speedometer */}
          <div class="relative flex flex-col items-center justify-center w-48 h-48 rounded-full border-4 border-white/5 bg-gradient-to-b from-white/10 to-transparent shadow-inner">
            <p class="text-[72px] leading-none font-black tracking-tighter drop-shadow-lg text-white font-heading">
              {Math.round(speed())}
            </p>
            <p class="text-white/60 tracking-[4px] uppercase font-bold text-sm mt-1">km/h</p>

            {/* Circular Speed Progress */}
            <svg class="absolute top-0 left-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="96" cy="96" r="90"
                stroke="rgba(239, 68, 68, 0.8)"
                stroke-width="6"
                fill="none"
                stroke-dasharray="565"
                stroke-dashoffset={565 - (565 * speed() / 200)}
                stroke-linecap="round"
                class="transition-all duration-500 ease-out"
              />
            </svg>
          </div>

          {/* Right Stats: RPM & Fuel */}
          <div class="flex flex-col items-end gap-6 w-1/4">
            <div class="text-right">
              <p class="text-white/40 tracking-widest uppercase text-xs font-bold mb-1">RPM (Need OBD2)</p>
              <p class="text-2xl font-heading text-orange-400 opacity-50">
                0.0
              </p>
            </div>
            <div class="flex flex-col items-end">
              <p class="text-white/40 tracking-widest uppercase text-xs font-bold mb-2">Fuel (Need OBD2)</p>
              <div class="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="w-[0%] h-full bg-cta shadow-[0_0_10px_rgba(34,197,94,0.8)] rounded-full"></div>
              </div>
              <p class="text-white/60 text-xs font-bold mt-1.5">--</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CarDashboard;
