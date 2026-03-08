import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aptsworks.in"),
  title: {
    default: "AptsWorks",
    template: "%s | AptsWorks",
  },
  description: "Secure cloud document storage for real estate professionals. Upload, organize, and access your documents from anywhere.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "AptsWorks",
    title: "AptsWorks — Secure Cloud Document Storage",
    description: "Upload, organize, and access your real estate documents from anywhere. Mobile-first, secure, and always available.",
    url: "https://aptsworks.in",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512, alt: "AptsWorks" }],
  },
  twitter: {
    card: "summary",
    title: "AptsWorks — Secure Cloud Document Storage",
    description: "Upload, organize, and access your real estate documents from anywhere.",
    images: ["/icons/icon-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AptsWorks",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
