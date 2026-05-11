import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  SPOTIFY_NOW_PLAYING_ENDPOINT,
  SPOTIFY_SAVED_ENDPOINT,
  procedure,
  router,
} from "../utils";

let spotifyCooldownUntil = 0;

export default router({
  nowPlaying: procedure.query(
    async ({ ctx }) => {
      try {
        /*
         * Global cooldown
         */
        if (
          Date.now() <
          spotifyCooldownUntil
        ) {
          return {
            is_playing: false,
            error:
              "RATE_LIMITED",
          };
        }

        /*
         * Abort slow requests
         */
        const controller =
          new AbortController();

        const timeout =
          setTimeout(() => {
            controller.abort();
          }, 8000);

        let res: Response;

        try {
          res = await fetch(
            SPOTIFY_NOW_PLAYING_ENDPOINT,
            {
              headers: {
                Authorization:
                  ctx.req.headers.get(
                    "Authorization"
                  ) ?? "",
              },

              signal:
                controller.signal,
            }
          );
        } finally {
          clearTimeout(
            timeout
          );
        }

        const status =
          res.status;

        /*
         * No playback
         */
        if (status === 204) {
          return {
            is_playing: false,
          } as SpotifyApi.CurrentPlaybackResponse;
        }

        /*
         * Forbidden
         */
        if (status === 403) {
          return {
            is_playing: false,
            error:
              "FORBIDDEN",
          };
        }

        /*
         * Rate limit
         */
        if (status === 429) {
          const retryAfter =
            Number(
              res.headers.get(
                "Retry-After"
              ) || 60
            );

          /*
           * Save cooldown timestamp
           */
          spotifyCooldownUntil =
            Date.now() +
            retryAfter *
              1000;

          console.log(
            `Spotify cooldown for ${retryAfter}s`
          );

          return {
            is_playing: false,
            error:
              "RATE_LIMITED",
          };
        }

        /*
         * Other errors
         */
        if (!res.ok) {
          const errorText =
            await res.text();

          console.log(
            "Spotify API error:",
            errorText
          );

          return {
            is_playing: false,
            error:
              "FETCH_FAILED",
          };
        }

        return (await res.json()) as SpotifyApi.CurrentPlaybackResponse;
      } catch (e) {
        /*
         * Timeout / network errors
         */
        if (
          e instanceof DOMException &&
            e.name === "AbortError"
        ) {
          console.log(
            "Spotify request timeout"
          );
        } else {
          console.log(
            "nowPlaying error",
            e
          );
        }

        return {
          is_playing: false,
          error:
            "FETCH_FAILED",
        };
      }
    }
  ),

  saved: procedure
    .input(
      z.object({
        ids: z.string().array(),
      })
    )
    .query(
      async ({
        input,
        ctx,
      }) => {
        try {
          const controller =
            new AbortController();

          const timeout =
            setTimeout(() => {
              controller.abort();
            }, 8000);

          let response: Response;

          try {
            response =
              await fetch(
                `${SPOTIFY_SAVED_ENDPOINT}?` +
                  new URLSearchParams(
                    {
                      ids: `${input.ids.join(
                        ","
                      )}`,
                    }
                  ),
                {
                  method: "GET",

                  headers: {
                    Authorization:
                      ctx.req.headers.get(
                        "Authorization"
                      ) ?? "",
                  },

                  signal:
                    controller.signal,
                }
              );
          } finally {
            clearTimeout(
              timeout
            );
          }

          if (
            !response.ok
          ) {
            return [];
          }

          return (await response.json()) as Boolean[];
        } catch (e) {
          console.log(
            "saved error",
            e
          );

          return [];
        }
      }
    ),
});