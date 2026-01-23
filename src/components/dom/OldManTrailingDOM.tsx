'use client'
import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getAssetUrl } from '@/lib/getAssetUrl'

interface OldManTrailingDOMProps {
    scrollProgress: number // 0 to 1
}

export default function OldManTrailingDOM({ scrollProgress }: OldManTrailingDOMProps) {
    const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 })

    // Update window size
    useEffect(() => {
        const updateSize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }
        updateSize()
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    // Constants
    const GIFS_PER_ROW = 13 // Always show 13 GIFs per row
    const SPACING_X = -10 // Small overlap for seamless trailing
    const ORIGINAL_GIF_WIDTH = 420
    const ORIGINAL_GIF_HEIGHT = 524

    // Calculate GIF size based on window width to fit all 13
    const totalSpacingWidth = (GIFS_PER_ROW - 1) * SPACING_X
    const GIF_WIDTH = (windowSize.width - totalSpacingWidth) / GIFS_PER_ROW
    const GIF_HEIGHT = GIF_WIDTH * (ORIGINAL_GIF_HEIGHT / ORIGINAL_GIF_WIDTH)

    // Calculate how many rows fit
    const SPACING_Y = 0 // Keep rows tight
    const TOTAL_ROWS = Math.ceil((windowSize.height - GIF_HEIGHT) / (GIF_HEIGHT + SPACING_Y)) + 1
    const TOTAL_GIFS = TOTAL_ROWS * GIFS_PER_ROW

    // Show more GIFs per scroll for smoother feel - 1 per 0.5% of scroll
    const visibleGifCount = Math.min(Math.floor(scrollProgress * 200), TOTAL_GIFS)

    // Calculate stagger delay for each GIF
    const getStaggerDelay = (index: number) => {
        // Each GIF gets a delay based on its position in the sequence
        // Creates a wave effect where GIFs appear sequentially
        return index * 0.015 // 15ms delay between each GIF
    }

    const positions = useMemo(() => {
        const pos = []
        let gifIndex = 0

        // Generate positions for all visible GIFs
        for (let row = 0; row < TOTAL_ROWS && gifIndex < visibleGifCount; row++) {
            const y = row * (GIF_HEIGHT + SPACING_Y)

            // Even rows (0, 2, 4...): Right to Left - use folder A
            if (row % 2 === 0) {
                // Start from right edge and move left
                const startX = windowSize.width - GIF_WIDTH
                for (let col = 0; col < GIFS_PER_ROW && gifIndex < visibleGifCount; col++) {
                    const x = startX - (col * (GIF_WIDTH + SPACING_X))

                    // Only add if within viewport bounds
                    if (x >= -GIF_WIDTH && y < windowSize.height) {
                        const gifNumber = col % 13
                        pos.push({
                            id: `A-row${row}-col${col}`,
                            src: getAssetUrl(`/assets/oldman/A/oldman${gifNumber}.gif`),
                            x,
                            y,
                            index: gifIndex // Add index for stagger delay
                        })
                        gifIndex++
                    }
                }
            }
            // Odd rows (1, 3, 5...): Left to Right - use folder B
            else {
                // Start from left edge and move right
                for (let col = 0; col < GIFS_PER_ROW && gifIndex < visibleGifCount; col++) {
                    const x = col * (GIF_WIDTH + SPACING_X)

                    // Only add if within viewport bounds
                    if (x < windowSize.width && y < windowSize.height) {
                        const gifNumber = col % 13
                        pos.push({
                            id: `B-row${row}-col${col}`,
                            src: getAssetUrl(`/assets/oldman/B/oldmanR${gifNumber}.gif`),
                            x,
                            y,
                            index: gifIndex // Add index for stagger delay
                        })
                        gifIndex++
                    }
                }
            }
        }

        return pos
    }, [visibleGifCount, windowSize, GIFS_PER_ROW, TOTAL_ROWS, GIF_WIDTH, GIF_HEIGHT, SPACING_X, SPACING_Y])

    // Removal of debug logs to keep production code clean as per best practices

    return (
        <div className="absolute inset-0 pointer-events-none z-[10]">
            {positions.map((pos) => (
                <motion.div
                    key={pos.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.3,
                        delay: getStaggerDelay(pos.index),
                        ease: 'easeOut'
                    }}
                    style={{
                        position: 'fixed',
                        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                        width: `${GIF_WIDTH}px`,
                        height: `${GIF_HEIGHT}px`,
                    }}
                >
                    <img
                        src={pos.src}
                        alt={pos.id}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </motion.div>
            ))}
        </div>
    )
}