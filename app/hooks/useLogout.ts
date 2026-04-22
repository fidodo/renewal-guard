// hooks/useLogout.ts
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { clearUser } from "../store/slices/userSlice";
import { clearSubscriptions } from "../store/slices/subscriptionSlice";

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = useCallback(async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      // Call logout API if token exists
      if (token) {
        await fetch(`/api/v1/auth/sign-out`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        }).catch((error) => {
          console.error("Logout API error:", error);
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all storage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Clear all Redux state
      dispatch(clearUser());
      dispatch(clearSubscriptions());

      // Redirect to home
      router.push("/");
    }
  }, [dispatch, router]);

  return { logout };
};
