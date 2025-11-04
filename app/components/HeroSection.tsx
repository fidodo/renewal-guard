// components/HeroSection.tsx
import Link from "next/link";

export const HeroSection = () => {
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
              className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-6 sm:text-base"
            >
              Get Started Free
            </Link>
            <Link
              href="/learn-more"
              className="rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:px-6 sm:text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
