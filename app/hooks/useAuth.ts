"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/slices/userSlice";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();
  const authCheckRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (authCheckRef.current) return;
      authCheckRef.current = true;
      try {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!token || !refreshToken) {
          setIsLoading(false);
          setIsAuthenticated(false);
          dispatch(clearUser());
          return;
        }

        const response = await fetch("http://localhost:5000/api/v1/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsAuthenticated(true);
            dispatch(setUser(data.user));
          } else {
            // Try to refresh token
            const refreshResponse = await fetch(
              "http://localhost:5000/api/v1/auth/refresh-token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
              }
            );

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.success) {
                localStorage.setItem("token", refreshData.accessToken);
                localStorage.setItem("refreshToken", refreshData.refreshToken);

                // Retry original request with new token
                const retryResponse = await fetch(
                  "http://localhost:5000/api/v1/auth/me",
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${refreshData.accessToken}`,
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (retryResponse.ok) {
                  const retryData = await retryResponse.json();
                  if (retryData.success) {
                    setIsAuthenticated(true);
                    dispatch(setUser(retryData.user));
                  } else {
                    throw new Error("Authentication failed after refresh");
                  }
                }
              } else {
                throw new Error("Token refresh failed");
              }
            } else {
              throw new Error("Token refresh failed");
            }
          }
        } else {
          throw new Error("API error");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        dispatch(clearUser());
      } finally {
        setIsLoading(false);
        authCheckRef.current = false;
      }
    };

    checkAuth();
  }, [dispatch]);

  return { isLoading, isAuthenticated };
};
