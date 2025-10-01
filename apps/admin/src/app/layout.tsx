import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "Administrative dashboard for Comic Creator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
