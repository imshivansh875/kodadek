import { Component } from "solid-js";
import SvgSpotifyWhite from "./icons/spotify-white.svg";

const Screensaver: Component = (props) => {
  return (
    <div class="w-full h-full bg-base flex flex-col items-center justify-center transition-colors duration-1000">
      <div class="relative flex items-center justify-center animate-pulse">
        <div class="absolute w-40 h-40 bg-cta/20 rounded-full blur-2xl"></div>
        <img
          class="opacity-60 relative z-10 transition-transform duration-500 hover:scale-110"
          src={SvgSpotifyWhite}
          width={"150"}
          height={"150"}
        />
      </div>
      <p class="mt-12 font-heading text-lg text-baseText/40 tracking-widest uppercase">Waiting for music</p>
    </div>
  );
};

export default Screensaver;
