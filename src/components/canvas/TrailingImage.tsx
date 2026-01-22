import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { getAssetUrl } from '@/lib/getAssetUrl'

interface TrailingImageProps {
    scrollProgress: number // 0 to 1 representing the progress through the trailing section
}

export default function TrailingImage({ scrollProgress }: TrailingImageProps) {
    const { viewport } = useThree()

    // Constants
    const GIF_WIDTH = 420
    const GIF_HEIGHT = 524
    const OFFSET_X = 240
    const TOTAL_GIFS_A = 13
    const TOTAL_GIFS_B = 13
    const TOTAL_STEPS = TOTAL_GIFS_A + TOTAL_GIFS_B

    // Calculate which GIFs should be visible based on scroll progress
    // We want to reveal one GIF per "step" of scroll
    const visibleCount = Math.floor(scrollProgress * TOTAL_STEPS)

    // Sequence A: Right to Left
    // Start: X = viewport - 420 (Top Right)
    // Step: -240px
    const sequenceA = Array.from({ length: TOTAL_GIFS_A }).map((_, i) => {
        // Position calculation in CSS pixels relative to the viewport container
        // We use Html to position absolutely
        const x = `calc(100vw - ${GIF_WIDTH}px - ${i * OFFSET_X}px)`
        const y = 0
        return {
            id: `A-${i}`,
            src: getAssetUrl(`/assets/oldman/A/oldman${i}.gif`),
            style: { right: `${GIF_WIDTH + i * OFFSET_X}px`, top: 0 }, // Using right for easier alignment from right edge? 
            // User said: X = viewport - 420. 
            // If we use left:
            // left = 100vw - 420 - i*240
            left: `calc(100vw - ${GIF_WIDTH}px - ${i * OFFSET_X}px)`,
            top: 0
        }
    })

    // Sequence B: Left to Right
    // Start: X = 0 (Left Edge), Y = 524 (Second Row)
    // Step: +240px
    const sequenceB = Array.from({ length: TOTAL_GIFS_B }).map((_, i) => {
        return {
            id: `B-${i}`,
            src: getAssetUrl(`/assets/oldman/B/oldmanR${i}.gif`),
            left: `${i * OFFSET_X}px`,
            top: `${GIF_HEIGHT}px`
        }
    })

    const allImages = [...sequenceA, ...sequenceB]

    return (
        <group>
            {allImages.map((img, index) => {
                if (index > visibleCount) return null

                return (
                    <Html
                        key={img.id}
                        position={[0, 0, 0]} // We use CSS positioning
                        style={{
                            position: 'fixed',
                            left: img.left,
                            top: img.top,
                            width: `${GIF_WIDTH}px`,
                            height: `${GIF_HEIGHT}px`,
                            pointerEvents: 'none',
                            zIndex: 10 + index, // Ensure stacking order
                        }}
                        // We need to ensure it's fullscreen to use viewport relative coordinates correctly
                        fullscreen
                        zIndexRange={[100, 0]}
                    >
                        <img
                            src={img.src}
                            alt={img.id}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </Html>
                )
            })}
        </group>
    )
}
