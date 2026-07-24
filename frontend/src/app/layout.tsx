import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sustainable XJTLU | Student Project Beta",
  description:
    "A student-built pilot platform for discovering and improving sustainability information at XJTLU.",
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
