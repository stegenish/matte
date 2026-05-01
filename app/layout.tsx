import type { Metadata } from "next";
import "./globals.css";
import { ProfilProvider } from "@/src/komponenter/ProfilProvider";

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
      <body className="antialiased">
        <ProfilProvider>{children}</ProfilProvider>
      </body>
    </html>
  );
}
