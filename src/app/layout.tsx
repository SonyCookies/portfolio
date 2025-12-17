import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import FabMenu from "@/components/FabMenu";
import ToastContainer from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const clash = localFont({
  variable: "--font-clash",
  display: "swap",
  src: [
    { path: "../../public/fonts/Clash_Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Clash_Bold.otf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Sonny Sarcia | Full Stack Developer",
  description: "SonyCookies Portfolio",
  icons: {
    icon: "/battle.png",
    shortcut: "/battle.png",
    apple: "/battle.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${clash.className} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div>{children}</div>
        <FabMenu />
        <ToastContainer />
      </body>
    </html>
  );
}
