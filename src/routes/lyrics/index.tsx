import {
  createEffect,
  createSignal,
} from "solid-js";

import LyricsView from "~/components/LyricsView";

import {
  getAuthTokenSignal,
  useSpotifyAuth,
} from "~/components/hooks/useSpotifyAuth";

const CARD_HEIGHT = 715;
const CARD_WIDTH = 815;

export default function LyricsRoute() {
  useSpotifyAuth();

  const [isAuthenticated, setIsAuthenticated] =
    createSignal(false);

  const [showAuthError, setShowAuthError] =
    createSignal(false);

  /*
   * Reactive auth state
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
      {isAuthenticated() && (
        <div class="flex items-center justify-center w-screen h-screen text-white">
          <div
            class="relative flex"
            style={{
              flex: "none",
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
            }}
          >
            <div
              class="relative text-white rounded-3xl overflow-hidden"
              style={{
                flex: "none",
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transform:
                  "translateZ(0)",
                "scroll-snap-align":
                  "center",
              }}
            >
              {getAuthTokenSignal?.() && (
              <LyricsView />
              )}
            </div>
          </div>
        </div>
      )}

      {showAuthError() && (
        <div class="grid items-center justify-center h-screen">
          <p class="text-white text-center max-w-sm">
            Unable to authenticate
            with API. Have you set
            the proper auth tokens
            in the ".env"
            configuration file?
          </p>
        </div>
      )}
    </main>
  );
}