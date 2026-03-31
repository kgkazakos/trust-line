import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "trust-line — Agentic Payment Trust Mapping",
  description:
    "Map the Trust Line for autonomous payment features. Simulate how five payment user archetypes respond across the Identity Control vs Agent Autonomy spectrum.",
  openGraph: {
    title: "trust-line — Agentic Payment Trust Mapping",
    description:
      "Computational Prototyping for agentic payment UX. Map trust positions, generate Intervention Boundary specs, export design briefs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative">{children}</body>
    </html>
  );
}
