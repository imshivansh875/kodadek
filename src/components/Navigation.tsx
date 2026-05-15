import { Component } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { Music, Clock, Car, Cpu, Image as ImageIcon, Mic2 } from "lucide-solid";

const Navigation: Component = () => {
  const location = useLocation();

  const navItems = [
    { href: "/", icon: Music, label: "Player" },
    { href: "/car", icon: Car, label: "Dashboard" },
    { href: "/stats", icon: Cpu, label: "System" },
    { href: "/clock", icon: Clock, label: "Clock" },
    { href: "/gif", icon: ImageIcon, label: "Visuals" },
    { href: "/lyrics", icon: Mic2, label: "Lyrics" },
  ];

  return (
    <div class="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-6 px-4 py-8 backdrop-blur-2xl bg-black/40 border border-white/10 rounded-[40px] shadow-2xl z-50 transition-all duration-300 hover:bg-black/60 group">
      {navItems.map((item) => {
        const isActive = () => location.pathname === item.href;
        return (
          <A
            href={item.href}
            class={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-cta ${isActive()
                ? "bg-cta text-white shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-110"
                : "bg-white/5 text-white/50 hover:bg-white/15 hover:text-white hover:scale-105"
              }`}
          >
            <item.icon size={28} strokeWidth={isActive() ? 2.5 : 2} />
            <span class="absolute left-full ml-6 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl text-sm font-semibold opacity-0 -translate-x-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap border border-white/10 text-white font-sans">
              {item.label}
            </span>
          </A>
        );
      })}
    </div>
  );
};

export default Navigation;
