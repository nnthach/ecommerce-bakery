import type { Metadata } from "next";
import { Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/context/I18nContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700", "800"],
});
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Petit Bakery - Baked With Passion, Shared With Love",
  description:
    "Petit Bakery handcrafts fresh bread, pastries, and cakes daily using honest ingredients and real care — bringing genuine value to every customer.",
  keywords: ["bakery", "bread", "pastries", "cakes", "artisan bakery"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dancingScript.variable} antialiased`}
      >
        <I18nProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </I18nProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
