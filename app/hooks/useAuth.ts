"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/slices/userSlice";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent running multiple times
      if (hasCheckedAuth.current) return;
      hasCheckedAuth.current = true;

      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      // No tokens -> clear user and exit
      if (!token || !refreshToken) {
        handleAuthFailure();
        setIsLoading(false);
        return;
      }

      try {
        // ✅ Attempt to validate current token
        const response = await fetch("http://localhost:5000/api/v1/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include", // ✅ helps with CORS if backend sends cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            dispatch(setUser(data.user));
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        }

        // ❌ Token expired or invalid → try refresh
        if (response.status === 401) {
          await refreshAuthToken(refreshToken);
        } else {
          throw new Error(`Auth failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        handleAuthFailure();
      } finally {
        setIsLoading(false);
      }
    };

    const refreshAuthToken = async (refreshToken: string) => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          credentials: "include",
        });

        if (!res.ok) throw new Error("Token refresh failed");

        const data = await res.json();

        if (data.success && data.data?.token) {
          localStorage.setItem("token", data.data.token);

          // ✅ Retry original request
          const retry = await fetch("http://localhost:5000/api/v1/auth/me", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.data.token}`,
            },
            credentials: "include",
          });

          if (retry.ok) {
            const retryData = await retry.json();
            if (retryData.success) {
              dispatch(setUser(retryData.user));
              setIsAuthenticated(true);
              return;
            }
          }
        }

        throw new Error("Authentication failed after refresh");
      } catch (error) {
        console.error("Token refresh error:", error);
        handleAuthFailure();
      }
    };

    const handleAuthFailure = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      dispatch(clearUser());
    };

    checkAuth();
  }, [dispatch]);

  return { isLoading, isAuthenticated };
};
