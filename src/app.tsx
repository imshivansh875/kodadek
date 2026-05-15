// @refresh reload
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/righteous/400.css";
import "@unocss/reset/tailwind.css";
import "virtual:uno.css";

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Suspense, createSignal } from "solid-js";
import { httpBatchLink } from "solid-trpc";
import { getAuthTokenSignal } from "./components/hooks/useSpotifyAuth";
import { trpc } from "./utils/trpc";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
};

export default function App() {
  const [queryClient] = createSignal(new QueryClient());
  const [trpcClient] = createSignal(
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          async headers() {
            return {
              authorization: `Bearer ${getAuthTokenSignal()}`,
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient()} queryClient={queryClient()}>
      <QueryClientProvider client={queryClient()}>
        <Router root={(props) => (
          <Suspense>
            {props.children}
          </Suspense>
        )}>
          <FileRoutes />
        </Router>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
