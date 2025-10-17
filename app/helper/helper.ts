export const checkAuthStatus = () => {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  const user = localStorage.getItem("user");

  console.log("🔐 Auth Status Check:", {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    hasUser: !!user,
    user: user ? JSON.parse(user) : null,
  });

  return { token, refreshToken, user: user ? JSON.parse(user) : null };
};
