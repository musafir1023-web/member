import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ayam Geprek Sambal Ijo - Pesan Online",
  description: "Pesan ayam geprek sambal ijo khas Aceh secara online. Rasa autentik, pengiriman cepat, dan harga terjangkau.",
  keywords: ["ayam geprek", "sambal ijo", "Aceh", "makanan online", "pesanan makanan"],
  icons: {
    icon: "/aceh-ornament.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}