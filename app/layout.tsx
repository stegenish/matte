import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matteapp",
  description: "Lekent matteopplæring for barn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body className="antialiased">{children}</body>
    </html>
  );
}
