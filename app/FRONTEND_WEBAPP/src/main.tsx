// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import AppProviders from "./Providers/AppProviders";
import PWAManager from "./components/PWAManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
createRoot(container).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProviders>
          <PWAManager />
          <div>
            <App />
          </div>
        </AppProviders>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
