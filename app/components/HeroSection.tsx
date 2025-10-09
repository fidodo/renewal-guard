// components/HeroSection.tsx
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Never Miss a Renewal Again
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Renewal Guard helps you track, manage, and automate all your
            subscription renewals in one place. Stay organized and save money.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Get Started Free
            </Link>
            <Link
              href="/learn-more"
              className="rounded-md border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
