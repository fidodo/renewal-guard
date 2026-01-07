"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/slices/userSlice";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showReloginPrompt, setShowReloginPrompt] = useState(false);
  const dispatch = useDispatch();
  const hasCheckedAuth = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 2;

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent running multiple times
      if (hasCheckedAuth.current && retryCount.current >= maxRetries) {
        setIsLoading(false);
        return;
      }
      hasCheckedAuth.current = true;

      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      // No tokens -> clear user and exit
      if (!token || !refreshToken) {
        handleAuthFailure(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        // ❌ Handle rate limiting - for 429, don't clear tokens immediately
        if (response.status === 429) {
          setAuthError(
            "Too many authentication attempts. Please wait a moment."
          );
          setShowReloginPrompt(true);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            dispatch(setUser(data.user));
            setIsAuthenticated(true);
            setAuthError(null);
            setShowReloginPrompt(false);
            retryCount.current = 0;
            setIsLoading(false);
            return;
          } else {
            console.log("❌ Auth check failed - success false:", data);
          }
        } else {
          console.log(
            "❌ Auth check failed - response not ok:",
            response.status,
            response.statusText
          );
        }

        // ❌ Token expired or invalid → try refresh
        if (response.status === 401) {
          await refreshAuthToken(refreshToken);
        } else {
          const errorText = await response.text();

          throw new Error(
            `Auth failed with status: ${response.status} - ${errorText}`
          );
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        // Only show error if not already showing relogin prompt
        if (!showReloginPrompt) {
          setAuthError("Authentication failed. Please log in again.");
        }
        // Only clear tokens for actual auth failures, not network errors
        if (
          error instanceof Error &&
          !error.message.includes("Failed to fetch")
        ) {
          handleAuthFailure(true);
        } else {
          handleAuthFailure(false);
        }
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    const refreshAuthToken = async (refreshToken: string) => {
      try {
        // Check retry count before attempting refresh
        if (retryCount.current >= maxRetries) {
          console.log("🚨 Max retries reached, showing relogin prompt");
          setAuthError("Session expired. Please log in again.");
          setShowReloginPrompt(true);
          setIsAuthenticated(false);
          handleAuthFailure(true);
          setIsLoading(false);
          return;
        }

        retryCount.current += 1;
        console.log(`🔄 Refresh attempt ${retryCount.current}/${maxRetries}`);

        const res = await fetch(`/api/v1/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          credentials: "include",
        });

        console.log("🔍 Refresh response status:", res.status);

        if (res.status === 429) {
          console.log("🚨 Refresh rate limited (429)");
          setAuthError("Too many refresh attempts. Please wait a moment.");
          setShowReloginPrompt(true);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        if (res.status === 401 || res.status === 403) {
          console.log("🔐 Refresh token invalid or expired (401/403)");
          const errorText = await res.text().catch(() => "No error details");
          console.log("⚠️ Refresh failed - authentication error:", errorText);

          setAuthError("Your session has expired. Please log in again.");
          setShowReloginPrompt(true);
          setIsAuthenticated(false);
          handleAuthFailure(true);
          setIsLoading(false);

          localStorage.removeItem("token");

          return;
        }

        if (!res.ok) {
          const errorText = await res
            .text()
            .catch(() => "Could not read error text");
          console.log("❌ Refresh failed - response body:", errorText);

          // Handle specific server errors
          if (res.status >= 500) {
            console.log("🖥️ Server error during refresh");
            setAuthError("Server error. Please try again later.");
          } else {
            setAuthError("Unable to refresh session. Please try again.");
          }

          // Show relogin prompt on client errors (4xx except 401/403 already handled)
          if (res.status >= 400 && res.status < 500) {
            setShowReloginPrompt(true);
          }

          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        console.log("✅ Refresh response data:", data);

        if (data.success && data.data?.token) {
          console.log("🔄 Saving new token to localStorage");
          localStorage.setItem("token", data.data.token);
          retryCount.current = 0;

          console.log("🔄 Retrying auth check with new token");
          const retry = await fetch(`/api/v1/auth/me`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.data.token}`,
            },
            credentials: "include",
          });

          if (retry.ok) {
            const retryData = await retry.json();
            if (retryData.success) {
              console.log("✅ Auth successful after refresh");
              dispatch(setUser(retryData.user));
              setIsAuthenticated(true);
              setAuthError(null);
              setShowReloginPrompt(false);
              setIsLoading(false);
              return;
            } else {
              console.log("❌ Auth failed after refresh - success false");
              setAuthError("Session validation failed. Please log in again.");
              setShowReloginPrompt(true);
            }
          } else {
            console.log("❌ Auth retry failed - status:", retry.status);
            setAuthError("Could not verify session. Please log in again.");
            setShowReloginPrompt(true);
          }
        } else {
          console.log("❌ Refresh response missing token or success false");
          setAuthError("Invalid refresh response. Please log in again.");
          setShowReloginPrompt(true);
        }

        setIsAuthenticated(false);
        handleAuthFailure(true);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Token refresh error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
          console.log("🌐 Network error during refresh");
          setAuthError("Network error. Please check your connection.");
        }

        if (retryCount.current >= maxRetries) {
          setAuthError("Session expired. Please log in again.");
          setShowReloginPrompt(true);
          handleAuthFailure(true);
        }
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    const handleAuthFailure = (clearTokens: boolean = true) => {
      console.log("🔒 Handling auth failure, clearTokens:", clearTokens);
      if (clearTokens) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        dispatch(clearUser());
      }
      setIsAuthenticated(false);
    };

    console.log("🚀 Starting auth check...");
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Function to handle relogin
  const handleRelogin = () => {
    console.log("🔑 User clicked relogin");
    setShowReloginPrompt(false);
    setAuthError(null);
    hasCheckedAuth.current = false;
    retryCount.current = 0;
    // Clear tokens and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    dispatch(clearUser());
    window.location.href = "/loginPage";
  };

  const dismissReloginPrompt = () => {
    setShowReloginPrompt(false);
    setAuthError(null);
  };

  console.log("🎯 useAuth return values:", {
    isLoading,
    isAuthenticated,
    authError,
    requiresRelogin: showReloginPrompt,
  });

  return {
    isLoading,
    isAuthenticated,
    authError,
    requiresRelogin: showReloginPrompt,
    handleRelogin,
    dismissReloginPrompt,
  };
};
