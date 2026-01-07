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

    if (token && refreshToken && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", user);

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
