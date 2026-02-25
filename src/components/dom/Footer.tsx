'use client'
import { lazy, Suspense } from 'react'
import Credits from './Credits'

const FooterCanvas = lazy(() => import('@/components/canvas/Footer/FooterCanvas'))

export default function Footer() {
    return (
        <section className="relative w-full">
            {/* Sticky Background: Stays fixed while we scroll through the container */}
            <div className="sticky top-0 h-screen w-full overflow-hidden -z-20">
                <Suspense fallback={null}>
                    <FooterCanvas />
                </Suspense>
            </div>

            {/* Scrolling Content: Overlays the sticky background */}
            {/* Relative positioning allows the section to grow with the content */}
            <div className="relative w-full z-10">
                <Credits />
            </div>
        </section>
    )
}
