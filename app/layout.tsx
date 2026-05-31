import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pacera Support Nexus | Phase 1 Verification",
  description:
    "Phase 1 data-foundation workspace for Pacera Support Nexus, a mock support operations dashboard for a Head of Support interview.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-ink-950)] text-[var(--color-surface-0)]">
        {children}
      </body>
    </html>
  );
}
