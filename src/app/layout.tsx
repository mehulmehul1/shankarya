import type { ReactNode } from 'react'
import SmoothScroll from "@/components/dom/SmoothScroll";
import Loader from "@/components/dom/Loader";
import "./globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <div className="bg-void antialiased selection:bg-signal selection:text-void">
            <SmoothScroll>
                <Loader />
                <main className="relative z-10 min-h-screen w-full">
                    {children}
                </main>
            </SmoothScroll>
        </div>
    );
}
