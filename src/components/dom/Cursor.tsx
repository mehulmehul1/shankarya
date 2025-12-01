'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'

export default function Cursor() {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 })
    const [isHovering, setIsHovering] = useState(false)

    // Get text from store
    const cursorText = useStore((state) => state.cursorText)

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })

            // Check if hovering over clickable elements
            // We extend this to check if cursorText is active, we force hover state
            const target = e.target as HTMLElement
            const isClickable = target.closest('a') || target.closest('button') || target.closest('.cursor-pointer')
            setIsHovering(!!isClickable)
        }
        window.addEventListener('mousemove', updateMousePosition)
        return () => window.removeEventListener('mousemove', updateMousePosition)
    }, [])

    return (
        <motion.div
            className="hidden md:flex fixed top-0 left-0 z-[9999] pointer-events-none items-center justify-center"
            animate={{
                x: mousePosition.x,
                y: mousePosition.y,
            }}
            transition={{ type: 'tween', ease: 'circOut', duration: 0.15 }}
        >
            {/* 1. The Dot (Your original cursor) */}
            <motion.div
                className="absolute w-4 h-4 bg-paper rounded-full mix-blend-difference"
                animate={{
                    // If text is present, scale up a bit more (3), otherwise use hover logic (2.5) or default (1)
                    scale: cursorText ? 3 : (isHovering ? 2.5 : 1),
                }}
            />

            {/* 2. The Text Label (New) */}
            <AnimatePresence>
                {cursorText && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 24 }} // 24px below cursor
                        exit={{ opacity: 0, scale: 0.5, y: 10 }}
                        className="absolute whitespace-nowrap"
                    >
                        <div className="bg-black/80 text-white px-2 py-1 rounded border border-white/20 backdrop-blur-md">
                            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                                {cursorText}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}