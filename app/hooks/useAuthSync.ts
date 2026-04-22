// hooks/useAuthSync.ts
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { clearUser, setUser } from "../store/slices/userSlice";
import { refreshAuthToken } from "./refresh-token";

export const useAuthSync = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(clearUser());
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch("/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            dispatch(setUser(data.user));
          } else {
            // Token invalid, try refresh
            const refreshed = await refreshAuthToken();
            if (!refreshed) {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              dispatch(clearUser());
            }
          }
        } else if (response.status === 401) {
          // Token expired, try refresh
          const refreshed = await refreshAuthToken();
          if (!refreshed) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            dispatch(clearUser());
          }
        }
      } catch (error) {
        console.error("Auth sync error:", error);
      }
    };

    checkAuth();

    // Set up interval to check auth periodically (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    // Listen for storage events (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        dispatch(clearUser());
        router.push("/loginPage");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch, router]);
};
