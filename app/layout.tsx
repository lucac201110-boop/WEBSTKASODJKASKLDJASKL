import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";
import LoadingScreen from "@/components/LoadingScreen";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400", "500", "600"] });
const siteUrl = "https://kubebclient.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Kubeb Client — Redefining the Minecraft Experience", template: "%s — Kubeb Client" },
  description: "Kubeb Client is a Minecraft client for 1.21.4 with a custom module system, accent color theming, and license-protected login tied to your Discord account.",
  keywords: ["Kubeb Client", "Minecraft client", "Minecraft mod", "Fabric client", "Minecraft 1.21.4"],
  authors: [{ name: "Kubeb Client" }],
  openGraph: { title: "Kubeb Client — Redefining the Minecraft Experience", description: "A Minecraft client for 1.21.4 with a custom module system and license-protected login.", url: siteUrl, siteName: "Kubeb Client", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Kubeb Client — Redefining the Minecraft Experience", description: "A Minecraft client for 1.21.4 with a custom module system and license-protected login." },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${mono.variable}`}><body className="bg-bg font-sans text-ink antialiased"><AuthProvider><LoadingScreen /><ScrollProgress /><CursorGlow />{children}</AuthProvider></body></html>;
}
