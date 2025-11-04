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
        console.log("🛑 Max retries reached, stopping auth checks");
        setIsLoading(false);
        return;
      }
      hasCheckedAuth.current = true;

      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      console.log("🔑 Tokens found:", {
        token: token ? "yes" : "no",
        refreshToken: refreshToken ? "yes" : "no",
      });

      // No tokens -> clear user and exit
      if (!token || !refreshToken) {
        console.log("❌ No tokens found");
        handleAuthFailure(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔄 Checking auth with token...");
        // ✅ Attempt to validate current token
        const response = await fetch(`/api/v1/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        console.log("🔍 Auth check response status:", response.status);

        // ❌ Handle rate limiting - for 429, don't clear tokens immediately
        if (response.status === 429) {
          console.log("🚨 Rate limited (429) detected - waiting...");
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
          console.log("✅ Auth check success data:", data);
          if (data.success) {
            console.log("🎯 User authenticated successfully:", data.user);
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
          console.log("🔄 Token expired (401), attempting refresh...");
          await refreshAuthToken(refreshToken);
        } else {
          const errorText = await response.text();
          console.log("❌ Non-401 error response body:", errorText);
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
          console.log("🔒 Clearing tokens due to auth failure");
          handleAuthFailure(true);
        } else {
          console.log("🌐 Network error, keeping tokens");
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

        // ❌ Handle rate limiting in refresh - don't clear tokens
        if (res.status === 429) {
          console.log("🚨 Refresh rate limited (429)");
          setAuthError("Too many refresh attempts. Please wait a moment.");
          setShowReloginPrompt(true);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          const errorText = await res.text();
          console.log("❌ Refresh failed - response body:", errorText);
          throw new Error(
            `Token refresh failed with status: ${res.status} - ${errorText}`
          );
        }

        const data = await res.json();
        console.log("✅ Refresh response data:", data);

        if (data.success && data.data?.token) {
          console.log("🔄 Saving new token to localStorage");
          localStorage.setItem("token", data.data.token);
          retryCount.current = 0;

          // ✅ Retry original request with new token
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
            }
          } else {
            console.log("❌ Auth retry failed - status:", retry.status);
          }
        } else {
          console.log("❌ Refresh response missing token or success false");
        }

        throw new Error("Authentication failed after refresh");
      } catch (error) {
        console.error("❌ Token refresh error:", error);
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
