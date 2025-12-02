'use client'
import dynamic from 'next/dynamic'
import Credits from './Credits'

const FooterCanvas = dynamic(() => import('@/components/canvas/Footer/FooterCanvas'), { ssr: false })

export default function Footer() {
    return (
        <section className="relative w-full">
            {/* 
               Container Height: 
               Needs to be tall enough to scroll through all credits.
               If we have 2 credits (each 100vh), plus the initial view (100vh), we need ~300vh.
            */}
            <div className="relative h-[300vh]">

                {/* Sticky Background: Stays fixed while we scroll through the container */}
                <div className="sticky top-0 h-screen w-full overflow-hidden -z-20">
                    <FooterCanvas />
                </div>

                {/* Scrolling Content: Overlays the sticky background */}
                {/* We push it down or pull it up depending on when we want credits to appear.
                    If we want the video to be alone for the first screen, we leave the first 100vh empty.
                */}
                <div className="absolute top-0 left-0 w-full pt-[100vh]">
                    <Credits />
                </div>
            </div>
        </section>
    )
}
