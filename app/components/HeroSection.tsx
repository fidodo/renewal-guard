"use client";
import Link from "next/link";

export const HeroSection = () => {
  const handleGoogleSignIn = () => {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log(
      "Full redirect URL:",
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`
    );

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  return (
    <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Never Miss a Renewal Again
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg md:text-xl">
            Renewal Guard helps you track, manage, and automate all your
            subscription renewals in one place. Stay organized and save money.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-6 sm:text-base text-center"
            >
              Get Started Free
            </Link>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:px-6 sm:text-base"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <Link
              href="/learn-more"
              className="rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:px-6 sm:text-base text-center"
            >
              Learn More
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Or{" "}
            <Link href="/login" className="text-primary hover:underline">
              sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};
