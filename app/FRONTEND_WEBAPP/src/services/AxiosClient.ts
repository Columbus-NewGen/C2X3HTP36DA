// src/services/axiosClient.ts
import axios from "axios";
import axiosRetry from "axios-retry";
import { tokenStorage, userStorage } from "../contexts/user.storage";

// ===== MODULE AUGMENTATION =====
// Extend AxiosRequestConfig to include custom skipAuthRedirect field
declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}
// -----------------------------
// 0) Validate ENV
// -----------------------------
const fallbackServerUrl =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8080`
    : "http://localhost:8080";
const serverUrl = import.meta.env.VITE_SERVER_URL || fallbackServerUrl;
if (!import.meta.env.VITE_SERVER_URL) {
  console.warn(`⚠️ Missing VITE_SERVER_URL, fallback to ${fallbackServerUrl}`);
}

// -----------------------------
// 1) CREATE AXIOS INSTANCE
// -----------------------------
const axiosClient = axios.create({
  baseURL: serverUrl || "",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// -----------------------------
// 2) AUTH TOKEN INTERCEPTOR
// -----------------------------
axiosClient.interceptors.request.use(
  (config) => {
    // Hybrid Auth:
    // 1. Cookies are sent automatically (withCredentials: true)
    // 2. We ALSO attach the token from body (stored in localStorage) as Bearer header.
    //    This ensures auth works even if cookies are blocked/cleared, or for CSRF protection.
    const token = tokenStorage.get();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// -----------------------------
// 3) AUTO RETRY FOR NETWORK ERROR
// -----------------------------
axiosRetry(axiosClient, {
  retries: 3, // retry 3 times
  retryDelay: (retryCount) => retryCount * 500, // 0.5s, 1s, 1.5s
  retryCondition: (error) => {
    // retry only on network error or timeout
    return error.code === "ECONNABORTED" || !error.response;
  },
});

// -----------------------------
// 4) GLOBAL ERROR HANDLER
// -----------------------------
// Flag to prevent multiple simultaneous logout redirects
let isLoggingOut = false;

axiosClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    // Log error details for debugging
    if (import.meta.env.DEV) {
      console.error("❌ API Error:", {
        status,
        url: error.config?.url,
        method: error.config?.method,
        data,
      });
    }

    // ---------- 401: Unauthorized (Session Expired) ----------
    // Check if the request has skipAuthRedirect flag (e.g., for login/register endpoints)
    const skipAuthRedirect = error.config?.skipAuthRedirect === true;

    if (status === 401 && !skipAuthRedirect) {
      if (import.meta.env.DEV) {
        console.warn("⚠️ Unauthorized — Session expired. Logging out...");
      }

      // Clear token and user from localStorage (client-side logout)
      // Since there's no logout API, we just clear the client state
      tokenStorage.clear();
      userStorage.clear();

      // Prevent multiple simultaneous redirects
      if (!isLoggingOut) {
        isLoggingOut = true;

        // Dispatch custom event to notify AuthContext (if needed)
        // This allows React components to react immediately without page reload
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("auth:logout", {
              detail: { reason: "session_expired" },
            }),
          );
        }

        // Redirect to login page (only if not already there)
        const currentPath = window.location.pathname;
        if (currentPath !== "/session-expired" && currentPath !== "/") {
          // Use window.location for a full redirect to ensure clean state
          // This will trigger AuthContext's useEffect to re-check auth status
          window.location.href = "/session-expired";
        } else {
          // If already on login/landing page, reset the flag after a short delay
          setTimeout(() => {
            isLoggingOut = false;
          }, 1000);
        }
      }
    } else if (status === 401 && skipAuthRedirect && import.meta.env.DEV) {
      // Log that we skipped the auth redirect for this request
      console.warn(
        "⚠️ Unauthorized (401) but skipAuthRedirect is true — Not logging out.",
      );
    }

    // ---------- 403: Forbidden ----------
    if (status === 403 && import.meta.env.DEV) {
      console.warn("❌ Forbidden — No permission to access this resource.");
    }

    // ---------- 400/409: Client Errors ----------
    if ((status === 400 || status === 409) && import.meta.env.DEV) {
      console.warn(`⚠️ Client Error (${status}):`, data);
      // Log full error details for debugging
      if (data?.error) {
        console.error("📋 Full error message:", data.error);
      }
      if (error.config?.data) {
        try {
          const payload =
            typeof error.config.data === "string"
              ? JSON.parse(error.config.data)
              : error.config.data;
          console.error("📤 Request payload that was sent:", payload);
        } catch (e) {
          console.error("📤 Request payload (raw):", error.config.data);
        }
      }
    }

    // ---------- 500+: Server Errors ----------
    if (status >= 500 && import.meta.env.DEV) {
      console.error("🔥 Server Error:", data);
    }

    return Promise.reject(error);
  },
);

// -----------------------------
export default axiosClient;
