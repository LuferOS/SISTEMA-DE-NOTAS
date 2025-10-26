import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SENA NOTAS LITAME",
  description: "Sistema de Gestión Educativa Integral del SENA - LITAME",
  keywords: ["SENA", "LITAME", "Educación", "Gestión", "Notas", "Sistema Educativo"],
  authors: [{ name: "Luis Guzman (LuferOS)" }],
  openGraph: {
    title: "SENA NOTAS LITAME",
    description: "Sistema de Gestión Educativa Integral del SENA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SENA NOTAS LITAME",
    description: "Sistema de Gestión Educativa Integral del SENA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
