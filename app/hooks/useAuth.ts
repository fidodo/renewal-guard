"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/slices/userSlice";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
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
            // Token is invalid
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            dispatch(clearUser());
          }
        } else {
          // API error
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          dispatch(clearUser());
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        dispatch(clearUser());
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  return { isLoading, isAuthenticated };
};
