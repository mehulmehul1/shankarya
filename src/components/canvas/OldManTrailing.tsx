'use client'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useMemo, useEffect, useState } from 'react'

interface OldManTrailingProps {
    scrollProgress: number // 0 to 1
}

export default function OldManTrailing({ scrollProgress }: OldManTrailingProps) {
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
    const GIF_WIDTH = 420
    const GIF_HEIGHT = 524
    const SPACING_X = 240 // Horizontal spacing between GIFs
    const SPACING_Y = 0 // Vertical spacing (keep rows tight)

    // Calculate how many GIFs fit per row
    const GIFS_PER_ROW = Math.floor((windowSize.width - GIF_WIDTH) / (GIF_WIDTH + SPACING_X)) + 1
    const TOTAL_ROWS = Math.ceil((windowSize.height - GIF_HEIGHT) / (GIF_HEIGHT + SPACING_Y)) + 1
    const MAX_GIFS = TOTAL_ROWS * GIFS_PER_ROW

    // Calculate how many GIFs to show based on scroll progress
    const visibleGifCount = Math.min(Math.floor(scrollProgress * MAX_GIFS), MAX_GIFS)

    // Debug logging
    console.log('OldManTrailing Debug:', {
        scrollProgress,
        windowSize,
        GIFS_PER_ROW,
        TOTAL_ROWS,
        MAX_GIFS,
        visibleGifCount
    })

    const positions = useMemo(() => {
        const pos = []
        let gifIndex = 0

        // Generate positions for all visible GIFs
        for (let row = 0; row < TOTAL_ROWS && gifIndex < visibleGifCount; row++) {
            const y = row * (GIF_HEIGHT + SPACING_Y)

            // Even rows (0, 2, 4...): Right to Left
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
                            src: `/assets/oldman/A/oldman${gifNumber}.gif`,
                            x,
                            y,
                            row,
                            col,
                            direction: 'right-to-left'
                        })
                        gifIndex++
                    } else {
                        break // Stop if we're outside viewport
                    }
                }
            }
            // Odd rows (1, 3, 5...): Left to Right
            else {
                // Start from left edge and move right
                for (let col = 0; col < GIFS_PER_ROW && gifIndex < visibleGifCount; col++) {
                    const x = col * (GIF_WIDTH + SPACING_X)

                    // Only add if within viewport bounds
                    if (x < windowSize.width && y < windowSize.height) {
                        const gifNumber = col % 13
                        pos.push({
                            id: `B-row${row}-col${col}`,
                            src: `/assets/oldman/B/oldmanR${gifNumber}.gif`,
                            x,
                            y,
                            row,
                            col,
                            direction: 'left-to-right'
                        })
                        gifIndex++
                    } else {
                        break // Stop if we're outside viewport
                    }
                }
            }
        }

        return pos
    }, [visibleGifCount, windowSize])

    return (
        <group>
            {positions.map((pos) => (
                <Html
                    key={pos.id}
                    position={[0, 0, 0]}
                    style={{
                        position: 'fixed',
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                        width: `${GIF_WIDTH}px`,
                        height: `${GIF_HEIGHT}px`,
                        pointerEvents: 'none',
                        zIndex: 10
                    }}
                    zIndexRange={[100, 0]}
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
                </Html>
            ))}
        </group>
    )
}