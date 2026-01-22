'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import Image from 'next/image'
import { getAssetUrl } from '@/lib/getAssetUrl'

interface CreditImage {
    src: string
    alt: string
    role: string
}

const credits: CreditImage[] = [
    { src: getAssetUrl('/assets/credits/jinsenparker.png'), alt: 'Credit 1', role: 'Director' },
    { src: getAssetUrl('/assets/credits/bobbysocx.png'), alt: 'Credit 2', role: 'Music' },
    { src: getAssetUrl('/assets/credits/deepeshbaisla.png'), alt: 'Credit 3', role: 'Art' },
    { src: getAssetUrl('/assets/credits/yashikasharma.png'), alt: 'Credit 4', role: 'Art' },
    { src: getAssetUrl('/assets/credits/sahilsablania.png'), alt: 'Credit 5', role: 'Art' },
    { src: getAssetUrl('/assets/credits/mehulsrivastava.png'), alt: 'Credit 6', role: 'Web Direction' },
]

function CreditItem({
    credit,
    index,
    total,
    scrollYProgress
}: {
    credit: CreditImage
    index: number
    total: number
    scrollYProgress: MotionValue<number>
}) {
    // Map global scroll to credit index (0 to total)
    // Extended to 'total' instead of 'total - 1' to give last credit space to exit
    const step = useTransform(scrollYProgress, [0, 1], [0, total])

    // Each credit slides in from bottom, stays centered, then slides up
    const slideInStart = index - 0.5
    const slideInEnd = index
    const slideOutStart = index + 1
    const slideOutEnd = index + 1.5

    // Y position: starts below (100vh), centers (0), exits above (-100vh)
    const y = useTransform(
        step,
        [slideInStart, slideInEnd, slideOutStart, slideOutEnd],
        ['100vh', '0vh', '0vh', '-100vh']
    )

    // Opacity: fade in as it slides in, fade out as it slides out
    const opacity = useTransform(
        step,
        [slideInStart, slideInEnd, slideOutStart, slideOutEnd],
        [0, 1, 1, 0]
    )

    return (
        <motion.div
            style={{
                y,
                opacity,
            }}
            className="absolute inset-0 flex items-center justify-center px-8"
        >
            <div className="relative w-full max-w-[70vw] md:max-w-[60vw] lg:max-w-[50vw] flex flex-col items-center gap-5">
                <div className="text-paper text-xl md:text-2xl font-mono tracking-wider uppercase mix-blend-difference">
                    {credit.role}
                </div>
                <Image
                    src={credit.src}
                    alt={credit.alt}
                    width={1200}
                    height={400}
                    className="w-full h-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    priority={index === 0}
                />
            </div>
        </motion.div>
    )
}

export default function Credits() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
        layoutEffect: false
    })

    return (
        // Container height: give each credit ~100vh of scroll space
        <div
            ref={containerRef}
            className="relative w-full"
            style={{ height: `${(credits.length + 1) * 100}vh` }}
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {credits.map((credit, i) => (
                    <CreditItem
                        key={credit.src}
                        credit={credit}
                        index={i}
                        total={credits.length}
                        scrollYProgress={scrollYProgress}
                    />
                ))}
            </div>
        </div>
    )
}