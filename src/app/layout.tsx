import type { Metadata } from "next";
import { Playfair_Display, Space_Mono } from "next/font/google";
import SmoothScroll from "@/components/dom/SmoothScroll";
import Loader from "@/components/dom/Loader";
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
    title: "SHANKARYA: Kutra Premi",
    description: "A Cinematic Experience.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${playfair.variable} ${spaceMono.variable}`}>
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
