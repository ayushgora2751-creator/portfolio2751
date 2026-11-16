import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ayush Gora — Creative Developer",
  description: "High-end scrollytelling personal portfolio with scroll-linked HTML5 Canvas animation and interactive WebGL experiences.",
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-accent-blue selection:text-white">
        {children}
      </body>
    </html>
  );
}
