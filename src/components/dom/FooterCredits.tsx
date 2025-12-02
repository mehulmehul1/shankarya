'use client'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useRef, useState } from 'react'

interface CreditItem {
    title: string
    subtitle?: string
}

const credits: CreditItem[] = [
    { title: "Director", subtitle: "Shankarya" },
    { title: "Creative Director", subtitle: "Name" },
    { title: "Producer", subtitle: "Name" },
    { title: "Cinematography", subtitle: "Name" },
    { title: "Editing", subtitle: "Name" },
    { title: "Sound Design", subtitle: "Name" },
    { title: "Music", subtitle: "Name" },
    { title: "Visual Effects", subtitle: "Name" },
    { title: "Production Design", subtitle: "Name" },
    { title: "Costume Design", subtitle: "Name" },
    { title: "Special Thanks", subtitle: "Names" }
]

export default function FooterCredits() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end end']
    })

    const [visibleCredits, setVisibleCredits] = useState<number[]>([])

    // Track which credits should be visible based on scroll
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const creditIndex = Math.floor(latest * credits.length)
        setVisibleCredits(prev => {
            const newVisible = Array.from({ length: creditIndex + 1 }, (_, i) => i)
            return newVisible
        })
    })

    return (
        <div ref={containerRef} className="relative h-[300vh]">
            {/* Each credit gets its own section */}
            {credits.map((credit, index) => (
                <motion.section
                    key={index}
                    className="h-screen flex items-center justify-center relative"
                    style={{
                        opacity: visibleCredits.includes(index) ? 1 : 0,
                    }}
                >
                    {/* Credit text with light leak effect */}
                    <div className="absolute inset-0 flex items-center justify-center z-[25] pointer-events-none">
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{
                                y: visibleCredits.includes(index) ? 0 : 100,
                                opacity: visibleCredits.includes(index) ? 1 : 0,
                            }}
                            transition={{
                                duration: 0.8,
                                delay: visibleCredits.includes(index) ? 0.2 : 0,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            className="text-center credit-light-leak"
                        >
                            <h2 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl">
                                {credit.title}
                            </h2>
                            {credit.subtitle && (
                                <p className="text-2xl md:text-4xl text-white/95 drop-shadow-xl">
                                    {credit.subtitle}
                                </p>
                            )}
                        </motion.div>
                    </div>
                </motion.section>
            ))}
        </div>
    )
}