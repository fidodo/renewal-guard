"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUser } from "../store/slices/userSlice";
import { useDispatch } from "react-redux";

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

interface LoginState {
  error: string;
  isLoading: boolean;
  success: boolean;
}

const initialState: LoginState = {
  error: "",
  isLoading: false,
  success: false,
};

async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !password) {
    return {
      ...prevState,
      error: "Please fill in all fields",
      isLoading: false,
    };
  }

  try {
    // Send sign-in request to backend API
    const response = await fetch("http://localhost:5000/api/v1/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

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
      return {
        ...prevState,
        error: data.message || data.error || "Login failed",
        isLoading: false,
      };
    }

    if (data.data.token && data.data.user) {
      // Save to localStorage
      localStorage.setItem("refreshToken", data.data.refreshToken);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // Update Redux state

      return {
        ...prevState,
        error: "",
        isLoading: false,
        success: true,
      };
    } else {
      return {
        ...prevState,
        error: "Invalid response from server",
        isLoading: false,
        success: false,
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      ...prevState,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      isLoading: false,
      success: false,
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Handle successful login
  useEffect(() => {
    if (state.success) {
      const userData = localStorage.getItem("user");
      if (userData) {
        dispatch(setUser(JSON.parse(userData)));
        setSuccessMessage("Login successful!");
      }
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    }
  }, [state.success, dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" action={formAction}>
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800 text-sm">{successMessage}</div>
              <div className="text-green-500 text-sm">Redirecting...</div>
            </div>
          )}
          {state.error && (
            <div className="rounded-md p-4 bg-red-50 border border-red-200">
              <div className="text-sm text-red-800">{state.error}</div>
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
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border rounded-md placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-2"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? (
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
