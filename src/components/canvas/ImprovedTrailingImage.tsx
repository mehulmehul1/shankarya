'use client'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { getAssetUrl } from '@/lib/getAssetUrl'

interface ImprovedTrailingImageProps {
    scrollProgress: number
}

export default function ImprovedTrailingImage({ scrollProgress }: ImprovedTrailingImageProps) {
    const { viewport } = useThree()

    // Constants
    const GIF_WIDTH = 420
    const GIF_HEIGHT = 524
    const OFFSET_X = 240
    const VIEWPORT_CENTER_X = viewport.width / 2
    const VIEWPORT_TOP = 0  // We want to start from top edge

    // Calculate how many GIFs should be visible based on scroll progress
    const visibleCount = Math.floor(scrollProgress * 13) // Show one GIF per ~7.7% of scroll
    const startIndex = Math.floor(visibleCount / 2) // Start from middle to show some on each side

    // Generate sequence positions
    const generateSequence = (startX: number, startY: number, count: number, stepX: number, stepY: number) => {
        return Array.from({ length: count }, (_, i) => ({
            id: `trail-${i}`,
            src: getAssetUrl(`/assets/oldman/A/oldman${i}.gif`),
            left: startX + (i * stepX),
            top: startY + (i * stepY),
            width: GIF_WIDTH,
            height: GIF_HEIGHT
        }))
    }

    // Sequence A: Right to Left (starts from right edge moving left)
    const sequenceA = generateSequence(
        VIEWPORT_CENTER_X + OFFSET_X,  // Start at right edge
        VIEWPORT_TOP,  // Top edge
        7,  // Show 7 GIFs
        -GIF_WIDTH,  // Move left each step
        0   // Stay on same row
    )

    // Sequence B: Left to Right (starts from left edge moving right)
    const sequenceB = generateSequence(
        VIEWPORT_CENTER_X - OFFSET_X - GIF_WIDTH,  // Start at left edge (first GIF)
        VIEWPORT_TOP + GIF_HEIGHT,  // One row down
        6,  // Show 6 GIFs
        GIF_WIDTH,  // Move right each step
        0   // Stay on same row
    )

    // All images to render
    const allImages = [...sequenceA, ...sequenceB]

    return (
        <group>
            {allImages.map((img, index) => {
                // Only render if within visible count
                if (index > visibleCount) return null

                return (
                    <Html
                        key={img.id}
                        position={[0, 0, 0]}
                        style={{
                            position: 'fixed',
                            left: `${img.left}px`,
                            top: `${img.top}px`,
                            width: `${GIF_WIDTH}px`,
                            height: `${GIF_HEIGHT}px`,
                            pointerEvents: 'none',
                            zIndex: 10 + index
                        }}
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