import type { Metadata } from "next";
import { Cormorant_Garamond,Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumina Med Spa | Advanced Clinical Aesthetics & Wellness",
  description: "A fictional med-spa website and appointment booking portfolio concept powered by BookFlow CRM.",
  openGraph: {
    title: "Lumina Med Spa | Advanced Clinical Aesthetics",
    description: "Explore a fictional med-spa booking and CRM portfolio concept.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${cormorant.variable} scroll-smooth h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FDFCFB] text-[#2D302E] selection:bg-[#8B9D83]/20 selection:text-[#1A1C1A]">
        <div className="bg-[#263c2c] px-4 py-2 text-center text-xs text-white">Portfolio concept · Fictional business, providers, treatments, and reviews. Use test details only.</div>
        {children}
      </body>
    </html>
  );
}
