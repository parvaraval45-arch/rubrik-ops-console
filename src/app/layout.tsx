import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rubrik MSP Operations Console",
  description:
    "Multi-tenant operations console for Managed Service Providers running Rubrik Security Cloud.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-canvas text-text-primary antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "rounded-md border border-border-default bg-surface text-text-primary shadow-card",
            },
          }}
        />
      </body>
    </html>
  );
}
