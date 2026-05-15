import { defineConfig } from "@unocss/vite";
import presetWind from "@unocss/preset-wind";

export default defineConfig({
  presets: [presetWind()],
  theme: {
    fontFamily: {
      sans: ["Poppins", "sans-serif"],
      heading: ["Righteous", "sans-serif"],
    },
    colors: {
      primary: "#1E1B4B",
      secondary: "#4338CA",
      cta: "#22C55E",
      base: "#0F0F23",
      baseText: "#F8FAFC",
      gray: {
        100: "#f5f5f5",
        200: "#eeeeee",
        300: "#e0e0e0",
        400: "#bdbdbd",
        500: "#9e9e9e",
        600: "#757575",
        700: "#616161",
        800: "#424242",
        900: "#212121",
      },
    },
  },
});
