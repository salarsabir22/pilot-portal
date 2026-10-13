import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { PilotProvider } from "@/components/pilot-context";

export const metadata: Metadata = {
  title: "swypejobs. pilot",
  description: "Private pilot portal for swypejobs students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap"
          rel="stylesheet"
        />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <PilotProvider>
          <Header />
          {children}
        </PilotProvider>
      </body>
    </html>
  );
}
