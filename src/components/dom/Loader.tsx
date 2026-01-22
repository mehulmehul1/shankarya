'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'

// Placeholder frames for a running dog (Simple stick figure logic for now)
const DOG_FRAMES = [
    "M10 50 L30 50 L40 30 L60 30 L70 50 L90 50 M40 30 L30 10 M60 30 L70 10", // Frame 1
    "M10 40 L30 50 L40 35 L60 35 L70 50 L90 40 M40 35 L45 15 M60 35 L55 15", // Frame 2
    "M10 60 L30 50 L40 25 L60 25 L70 50 L90 60 M40 25 L25 15 M60 25 L75 15", // Frame 3
]

export default function Loader() {
    const { loading, setLoading } = useStore()
    const [progress, setProgress] = useState(0)
    const [frameIndex, setFrameIndex] = useState(0)

    // Simulation of asset loading
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(() => setLoading(false), 800) // Slight delay at 100%
                    return 100
                }
                return prev + Math.random() * 2 // Random load speed
            })
        }, 50)

        // Dog Animation Loop
        const animTimer = setInterval(() => {
            setFrameIndex((prev) => (prev + 1) % DOG_FRAMES.length)
        }, 150) // Speed of running

        return () => {
            clearInterval(timer)
            clearInterval(animTimer)
        }
    }, [])

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void text-paper overflow-hidden"
                    exit={{
                        clipPath: 'circle(0% at 50% 50%)', // Ink/Iris wipe effect
                        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
                    }}
                >
                    {/* The Runner */}
                    <div className="relative w-64 h-32 flex items-center justify-center mb-8">
                        <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full stroke-paper fill-none stroke-2 overflow-visible"
                            style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))' }}
                        >
                            {/* Motion path for the dog */}
                            <motion.path
                                d={DOG_FRAMES[frameIndex]}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {/* Speed lines effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-void via-transparent to-transparent"
                            animate={{ opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                        />
                    </div>

                    {/* NGE Style Data Readout */}
                    <div className="font-mono text-xs md:text-sm tracking-widest flex flex-col items-center gap-2">
                        <span className="text-signal animate-pulse">SYSTEM SYNCHRONIZATION</span>

                        <div className="w-64 h-1 bg-gray-800 relative overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-paper"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="flex justify-between w-64 text-[10px] text-concrete">
                            <span>RATE: {Math.round(progress)}%</span>
                            <span>HOST: LOCAL</span>
                        </div>
                    </div>

                    {/* Background Grid/Noise Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
