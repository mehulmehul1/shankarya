import type { Metadata } from "next";
import { Playfair_Display, Space_Mono } from "next/font/google";
import SmoothScroll from "@/components/dom/SmoothScroll";
import Loader from "@/components/dom/Loader";
import { getAssetUrl } from "@/lib/getAssetUrl";
import "./globals.css";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair"
});

const spaceMono = Space_Mono({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-space-mono"
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://shankarya.com'),
    title: "SHANKARYA: Kutra Premi",
    description: "A Cinematic WebGPU Experience for Base and Farcaster.",
    manifest: "/.well-known/farcaster.json",
    openGraph: {
        title: "SHANKARYA - Kutra Premi",
        description: "A Cinematic WebGPU Experience",
        type: "website",
        images: [getAssetUrl("/assets/77.jpg")],
    },
    twitter: {
        card: "summary_large_image",
        title: "SHANKARYA - Kutra Premi",
        description: "A Cinematic WebGPU Experience",
        images: [getAssetUrl("/assets/77.jpg")],
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${playfair.variable} ${spaceMono.variable}`} suppressHydrationWarning>
            <body className="bg-void antialiased selection:bg-signal selection:text-void">
                <SmoothScroll>
                    <Loader />
                    <main className="relative z-10 min-h-screen w-full">
                        {children}
                    </main>
                </SmoothScroll>
            </body>
        </html>
    );
}
