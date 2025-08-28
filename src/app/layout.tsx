import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DependencyProvider } from "../presentation/providers/DependencyProvider";
import { AuthProvider } from "../presentation/providers/AuthProvider";
import { GoogleAnalyticsProvider } from "../presentation/providers/GoogleAnalyticsProvider";
import { Footer } from "../components/results/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gutcheck.AI - FICO Score for Entrepreneurs",
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
            <GoogleAnalyticsProvider>
              <div className="min-h-screen flex flex-col">
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </GoogleAnalyticsProvider>
          </AuthProvider>
        </DependencyProvider>
      </body>
    </html>
  );
}
