import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sustainable XJTLU",
  description: "A sustainability knowledge and action platform for XJTLU.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
