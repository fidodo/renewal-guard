// Add this enhanced refreshAuthToken function with detailed logging
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    console.log("🔄 Starting token refresh...");

    const refreshToken = localStorage.getItem("refreshToken");
    console.log("📋 Refresh token exists:", !!refreshToken);

    if (!refreshToken) {
      console.log("❌ No refresh token available");
      return false;
    }

    console.log("🌐 Sending refresh request...");
    const response = await fetch(
      "http://localhost:5000/api/v1/auth/refresh-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    console.log("📊 Refresh response status:", response.status);
    console.log("📊 Refresh response ok:", response.ok);

    if (!response.ok) {
      console.error("❌ Token refresh failed:", response.status);

      // Try to get error details
      try {
        const errorData = await response.json();
        console.error("📋 Refresh error details:", errorData);
      } catch (error) {
        console.error("📋 No JSON error response");
        console.log(error);
      }

      return false;
    }

    const data = await response.json();
    console.log("🔍 Refresh response data:", data);

    if (data.data.success && data.data.token && data.data.refreshToken) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      console.log("✅ Token refreshed successfully");
      console.log("📝 New token stored:", !!data.data.token);
      console.log("📝 New refresh token stored:", !!data.data.refreshToken);
      return true;
    }

    console.log("❌ Refresh response missing tokens:", data);
    return false;
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    return false;
  }
};
