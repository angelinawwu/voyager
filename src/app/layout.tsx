import type { Metadata } from "next";
import { Xanh_Mono } from "next/font/google";
import "./globals.css";

const xanhMono = Xanh_Mono({
  variable: "--font-xanh-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "the voyager golden record",
  description: "humanity's message to the universe",
  openGraph: {
    title: "the voyager golden record",
    description: "humanity's message to the universe",
    images: [
      {
        url: "/PreviewImage.png",
        width: 1200,
        height: 630,
        alt: "The Voyager Golden Record",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "the voyager golden record",
    description: "humanity's message to the universe",
    images: ["/PreviewImage.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${xanhMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
