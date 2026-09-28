import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoLens — Algorithm Visualization Platform",
  description: "Interactive code execution, debugging, and algorithm visualization",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased" style={{ backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }}>
        {children}
      </body>
    </html>
  );
}
