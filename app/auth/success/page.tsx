// app/auth/success/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const user = searchParams.get("user");

    console.log("🔑 Token received:", !!token);
    console.log("🔄 Refresh token received:", !!refreshToken);
    console.log("👤 User data received:", user);

    if (token && refreshToken && user) {
      // Store tokens in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", user);

      console.log("✅ Tokens stored in localStorage");

      // Redirect to dashboard
      router.push("/dashboard");
    } else {
      console.error("❌ Missing tokens or user data");
      router.push("/login?error=auth_failed");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Completing Authentication...
        </h2>
        <p>Please wait while we sign you in.</p>
      </div>
    </div>
  );
}

// Loading component for suspense
function AuthSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <p>Please wait while we complete authentication.</p>
      </div>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense fallback={<AuthSuccessLoading />}>
      <AuthSuccessContent />
    </Suspense>
  );
}
