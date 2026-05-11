import {
  createEffect,
  createSignal,
  Show,
} from "solid-js";

import {
  getAuthTokenSignal,
  useSpotifyAuth,
} from "~/components/hooks/useSpotifyAuth";

const CARD_WIDTH = 715;
const CARD_HEIGHT = 715;

export default function Gif() {
  useSpotifyAuth();

  const [isAuthenticated, setIsAuthenticated] =
    createSignal(false);

  const [showAuthError, setShowAuthError] =
    createSignal(false);

  /*
   * Reactive auth
   */
  createEffect(() => {
    const token =
      getAuthTokenSignal?.();

    if (
      token &&
      token.length > 0
    ) {
      setIsAuthenticated(true);
      setShowAuthError(false);
    } else {
      setIsAuthenticated(false);

      const timeout =
        setTimeout(() => {
          setShowAuthError(true);
        }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  });

  return (
    <main class="w-screen h-screen overflow-hidden bg-black text-white">
      <Show
        when={isAuthenticated()}
        keyed
      >
        <div class="flex items-center justify-center w-screen h-screen overflow-hidden">
          <div
            class="relative rounded-[32px] overflow-hidden shadow-2xl"
            style={{
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
              transform: "translateZ(0)",
            }}
          >
            {/* GIF Background */}
            <img
              src="/title.gif"
              alt="Background"
              class="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Dark overlay */}
            <div class="absolute inset-0 bg-black/30" />

            {/* Optional blur glow */}
            <div
              class="absolute inset-0 opacity-40 blur-3xl scale-110"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.12), transparent 70%)",
              }}
            />
          </div>
        </div>
      </Show>

      {showAuthError() && (
        <div class="grid items-center justify-center h-screen">
          <p class="text-white text-center max-w-sm">
            Unable to authenticate with API.
            Have you set the proper auth
            tokens in the ".env"
            configuration file?
          </p>
        </div>
      )}
    </main>
  );
}