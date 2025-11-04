"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUser } from "../store/slices/userSlice";
import { useDispatch } from "react-redux";
import { useActionState, useEffect } from "react";
import { NEXT_PUBLIC_API_URL, SERVER_URL } from "../../backend/config/env";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

interface RegisterState {
  error: string;
  isLoading: boolean;
  success: boolean;
  userData?: User;
}

const initialState: RegisterState = {
  error: "",
  isLoading: false,
  success: false,
};

async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const API_BASE_URL = NEXT_PUBLIC_API_URL || SERVER_URL;

  // Basic validation
  if (!name || !email || !password) {
    return {
      ...prevState,
      error: "Please fill in all fields",
      isLoading: false,
      success: false,
    };
  }

  try {
    // Send register request to backend API
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
      credentials: "include",
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Register endpoint not found. Check backend routes.");
      }
      if (response.status === 409) {
        throw new Error("User already exists with this email");
      }
      if (response.status === 400) {
        throw new Error("Invalid registration data");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    console.log("Register response data:", data);

    if (!data.success) {
      return {
        ...prevState,
        error: data.message || data.error || "Registration failed",
        isLoading: false,
        success: false,
      };
    }

    if (data.token && data.user) {
      // Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Return user data in state for Redux dispatch
      return {
        error: "",
        isLoading: false,
        success: true,
        userData: data.user,
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
    console.error("Register error:", error);
    return {
      ...prevState,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      isLoading: false,
      success: false,
    };
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );

  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (state.success) {
      const userData = localStorage.getItem("user");
      if (userData) {
        dispatch(setUser(JSON.parse(userData)));
        setSuccessMessage("Registration successful!");
      }
      router.push("/dashboard");
    }
  }, [state.success, dispatch, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join Renewal Guard today
            </p>
          </div>

          <form className="mt-8 space-y-6" action={formAction}>
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-green-800 text-sm">{successMessage}</div>
              </div>
            )}

            {state.error && (
              <div className="rounded-md p-4 bg-red-50 border border-red-200">
                <div className="text-sm text-red-800">{state.error}</div>
              </div>
            )}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border rounded-md placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-primary focus:border-primary focus:ring-2 focus:ring-offset-2"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2`}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2`}
                placeholder="Create a password (min. 6 characters)"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2`}
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-foreground"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:text-primary/80"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:text-primary/80"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/loginPage"
                  className="text-primary font-medium hover:text-primary/80"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
