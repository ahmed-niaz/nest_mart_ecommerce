import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import StoreLayoutWrapper from "@/components/shared/store-layout-wrapper";
import Providers from "@/components/providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NestMart - Your Online Grocery Store",
  description: "Fresh groceries delivered to your door",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Providers>
          <AuthProvider>
            <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}