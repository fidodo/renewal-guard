// lib/fetchWithAuth.ts
import { refreshAuthToken } from "@/app/hooks/refresh-token";

interface FetchWithAuthOptions extends RequestInit {
  skipAuth?: boolean;
  retryCount?: number;
}

export const fetchWithAuth = async (
  url: string,
  options: FetchWithAuthOptions = {},
): Promise<Response> => {
  const { skipAuth = false, retryCount = 0, ...fetchOptions } = options;
  const maxRetries = 1;

  const makeRequest = async (token?: string | null): Promise<Response> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Copy existing headers
    if (fetchOptions.headers) {
      const existingHeaders = fetchOptions.headers as Record<string, string>;
      Object.entries(existingHeaders).forEach(([key, value]) => {
        headers[key] = value;
      });
    }

    if (token && !skipAuth) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...fetchOptions,
      headers,
    });
  };

  const token = localStorage.getItem("token");
  let response = await makeRequest(token);

  // If unauthorized and we haven't exceeded retries, try to refresh token
  if (response.status === 401 && retryCount < maxRetries && !skipAuth) {
    console.log("Token expired, attempting refresh...");
    const refreshed = await refreshAuthToken();

    if (refreshed) {
      const newToken = localStorage.getItem("token");
      response = await makeRequest(newToken);

      if (response.ok) {
        return response;
      }
    }

    // Refresh failed or still unauthorized, clear everything
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Dispatch custom event for other tabs/components
    window.dispatchEvent(new StorageEvent("storage", { key: "token" }));

    // Redirect to login page
    window.location.href = "/loginPage";
    throw new Error("Session expired. Please login again.");
  }

  return response;
};
