import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
    },
    mutations: {
      retry: false,
    },
  },
});

function AuthTokenHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const token = params.get("access_token");
      if (token) {
        window.sessionStorage.setItem("alignment-memory-access-token", token);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);
  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthTokenHandler>
          <App />
        </AuthTokenHandler>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
