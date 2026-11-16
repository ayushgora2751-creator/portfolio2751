import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ayush Gora | Creative Developer",
  description:
    "High-end scrollytelling personal portfolio website for Ayush Gora, featuring scroll-linked canvas animation and modern projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#121212] text-white antialiased selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
        {children}
      </body>
    </html>
  );
}
