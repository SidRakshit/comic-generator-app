// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context"; // Import AuthProvider
import Navbar from "@/components/layouts/navbar"; // Assuming you have a Navbar
// import Footer from "@/components/layouts/footer"; // Assuming you have a Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Comic Generator App",
  description: "Create amazing comics easily!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        {/* Wrap Navbar and children inside AuthProvider */}
        <AuthProvider>
          <Navbar /> {/* Navbar is now INSIDE the provider */}
          <main className="flex-grow container mx-auto px-4 py-8">
            {children} {/* Page content is also inside */}
          </main>
          {/* <Footer /> Footer can be inside or outside depending on needs */}
        </AuthProvider>
      </body>
    </html>
  );
}
