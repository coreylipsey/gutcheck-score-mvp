import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DependencyProvider } from "../presentation/providers/DependencyProvider";
import { AuthProvider } from "../presentation/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gutcheck Score™ - FICO Score for Entrepreneurs",
  description: "Comprehensive assessment of your entrepreneurial readiness and fundability potential",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <DependencyProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </DependencyProvider>
      </body>
    </html>
  );
}
