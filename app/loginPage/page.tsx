"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUser } from "../store/slices/userSlice";
import { useDispatch } from "react-redux";
import { useAuth } from "../hooks/useAuth";

interface RefreshTokenResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  requiresReauth?: boolean;
}

// State to prevent multiple simultaneous refresh attempts
let refreshInProgress: Promise<boolean> | null = null;

// Clear tokens and prompt user to re-login
const promptReauthentication = (): void => {
  // Clear all auth tokensi do not have
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");

  // Show login modal or redirect to login page
  const shouldRelogin = window.confirm(
    "Your session has expired. Please log in again to continue."
  );

  if (shouldRelogin) {
    // Redirect to login page or show login modal
    window.location.href = "/loginPage";
  }
};

const handleInvalidRefreshToken = (): void => {
  console.log("Refresh token is invalid or expired");
  promptReauthentication();
};

const setTokens = (token: string, refreshToken: string): void => {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
};

const clearTokens = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

// Enhanced token refresh with re-authentication
const refreshAuthToken = async (): Promise<boolean> => {
  // Prevent multiple simultaneous refresh attempts
  if (refreshInProgress) {
    return refreshInProgress;
  }

  refreshInProgress = (async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.log("No refresh token available");
        promptReauthentication();
        return false;
      }

      const response = await fetch(`/api/v1/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      console.log("Refresh response:", response);

      if (!response.ok) {
        console.error("Token refresh failed:", response.status);

        // If refresh token is invalid/expired, prompt re-authentication
        if (response.status === 401 || response.status === 403) {
          handleInvalidRefreshToken();
        }
        return false;
      }

      const data: RefreshTokenResponse = await response.json();
      console.log("Refresh data:", data);
      // Server can indicate that re-authentication is required
      if (data.requiresReauth) {
        promptReauthentication();
        return false;
      }

      if (data.success && data.token && data.refreshToken) {
        setTokens(data.token, data.refreshToken);
        console.log("Token refreshed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  })();

  const result = await refreshInProgress;
  refreshInProgress = null;
  return result;
};

// Enhanced fetch with token refresh and retry logic
const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let token = localStorage.getItem("token");
  let retryCount = 0;
  const maxRetries = 1;

  const makeRequest = async (): Promise<Response> => {
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    // Add authorization header if token exists
    if (token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, requestOptions);

    // If token is expired, try to refresh and retry
    if (response.status === 401 && retryCount < maxRetries) {
      console.log("Token expired, attempting refresh...");
      const refreshSuccess = await refreshAuthToken();

      if (refreshSuccess) {
        // Get new token and retry request
        retryCount++;
        token = localStorage.getItem("token");
        return makeRequest(); // Recursive retry
      } else {
        // Refresh failed, clear tokens and return original response
        clearTokens();
      }
    }

    return response;
  };

  return makeRequest();
};

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

  // Validation (keep your existing code)
  if (!email || !password) {
    return {
      ...prevState,
      error: "Please fill in all fields",
      isLoading: false,
      success: false,
    };
  }

  try {
    const response = await fetchWithAuth(`/api/v1/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();
    console.log("Login response data:", data);

    // Handle specific error cases
    if (!response.ok || !data.success) {
      let errorMessage = data.error || data.message || "Login failed";

      // User-friendly error messages
      if (data.error === "User not found") {
        errorMessage =
          "No account found with this email. Please sign up first.";
      } else if (data.error === "Invalid credentials") {
        errorMessage = "Incorrect password. Please try again.";
      }

      return {
        ...prevState,
        error: errorMessage,
        isLoading: false,
        success: false,
      };
    }

    // Success case
    if (data.data?.token && data.data?.user) {
      try {
        localStorage.setItem("refreshToken", data.data.refreshToken || "");
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        return {
          error: "",
          isLoading: false,
          success: true,
        };
      } catch (error) {
        console.log("LocalStorage error:", error);
        return {
          ...prevState,
          error: "Failed to save login data. Please try again.",
          isLoading: false,
          success: false,
        };
      }
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

  // Use the auth hook
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log("User already authenticated, redirecting to dashboard...");
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle successful login
  useEffect(() => {
    if (state.success) {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          dispatch(setUser(JSON.parse(userData)));
          setSuccessMessage("Login successful!");

          // Redirect after success message is shown
          const redirectTimer = setTimeout(() => {
            router.push("/dashboard");
          }, 1000);

          return () => clearTimeout(redirectTimer);
        } else {
          setSuccessMessage("Login successful! Redirecting...");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error during login success handling:", error);
        setSuccessMessage("Login successful! Redirecting...");
        router.push("/dashboard");
      }
    }
  }, [state.success, dispatch, router]);

  // Clear error when user starts typing
  useEffect(() => {
    if (state.error) {
      const inputs = document.querySelectorAll("input");
      const clearError = () => {
        if (state.error) {
          // You might want to implement a way to clear the error state here
          // This would require modifying the useActionState approach or using a different state management
        }
      };

      inputs.forEach((input) => {
        input.addEventListener("input", clearError);
      });

      return () => {
        inputs.forEach((input) => {
          input.removeEventListener("input", clearError);
        });
      };
    }
  }, [state.error]);

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-foreground">
            {authLoading ? "Checking authentication..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" action={formAction}>
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800 text-sm font-medium">
                {successMessage}
              </div>
              <div className="text-green-600 text-sm mt-1">
                Redirecting to dashboard...
              </div>
            </div>
          )}

          {state.error && !state.success && (
            <div className="rounded-md p-4 bg-red-50 border border-red-200">
              <div className="text-sm text-red-800 font-medium">
                {state.error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border rounded-md placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isPending}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border rounded-md placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="Enter your password"
              />
            </div>
          </div>
          <div className="flex items-center justify-center pt-1 ">
            <p className="text-amber-600">
              * Password must be Minimum 6 characters long
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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

          <div className="text-center pt-4">
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
