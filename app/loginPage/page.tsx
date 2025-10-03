"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUser } from "../store/slices/userSlice";
import { useDispatch } from "react-redux";

interface LoginFormData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties you expect
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    token: string;
    refreshToken: string;
  };
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Send sign-in request to backend API
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/sign-in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 404) {
          throw new Error("Login endpoint not found. Check backend routes.");
        }
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log("Login response data:", data);

      if (!data.success) {
        setError(data.message || data.error || "Login failed");
        return;
      }

      if (data.data.token && data.data.user) {
        // Save to localStorage
        // localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Update Redux state
        dispatch(setUser(data.data.user));

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md p-4 bg-red-50 border border-red-200">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border rounded-md placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-2"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border rounded-md placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-2"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Don &lsquo;t have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
