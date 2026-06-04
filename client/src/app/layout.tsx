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
  title: {
    template: "%s | NestMart",
    default: "NestMart - Your Premium Grocery Store",
  },
  description: "Fresh groceries and organic honey delivered to your door.",
  openGraph: {
    title: "NestMart - Your Premium Grocery Store",
    description: "Fresh groceries and organic honey delivered to your door.",
    url: "https://nest-mart-frontend.vercel.app",
    siteName: "NestMart",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NestMart - Your Premium Grocery Store",
    description: "Fresh groceries and organic honey delivered to your door.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "NestMart",
              url: "https://nest-mart-frontend.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://nest-mart-frontend.vercel.app/products?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-background antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <AuthProvider>
            <StoreLayoutWrapper>{children}</StoreLayoutWrapper>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
