import type { Metadata } from "next";
import Providers from "./provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Renewal Reminder",
  description: "Renewal Guard Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
