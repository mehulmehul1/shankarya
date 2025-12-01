'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { extractColors, type ColorPalette } from '@/lib/colorExtractor'
import GradientBackground from './GradientBackground'
import { useStore } from '@/store/useStore'

// --- DATA ---
const GALLERY_DATA = [
    { src: '/assets/ropegifs/0004.gif', title: 'SEQUENCE_01', link: 'https://zora.co' },
    { src: '/assets/ropegifs/gif_5.gif', title: 'SEQUENCE_02', link: 'https://zora.co' },
    { src: '/assets/ropegifs/looped.gif', title: 'SEQUENCE_03', link: 'https://zora.co' },
    { src: '/assets/ropegifs/looped_4.gif', title: 'SEQUENCE_04', link: 'https://zora.co' },
    { src: '/assets/ropegifs/looped_7.gif', title: 'SEQUENCE_05', link: 'https://zora.co' },
    { src: '/assets/ropegifs/output_6.gif', title: 'SEQUENCE_06', link: 'https://zora.co' },
    { src: '/assets/ropegifs/output_7.gif', title: 'SEQUENCE_07', link: 'https://zora.co' }
]

const FRICTION = 0.92
const DRAG_SENS = 1.2

interface CardTransform {
    position: [number, number, number]
    rotation: [number, number, number]
    scale: number
    opacity: number
    blur: number
}

function mod(n: number, m: number) {
    return ((n % m) + m) % m
}

interface GifCarouselProps {
    scrollProgress?: number // 0 to 1 based on page scroll
    scrollVelocity?: number // Current scroll velocity for smooth interaction
}

export default function GifCarousel({ scrollProgress = 0, scrollVelocity = 0 }: GifCarouselProps) {
    const { viewport, size } = useThree()
    const setCursorText = useStore((state) => state.setCursorText)

    // Layout
    const isMobile = viewport.width < 5
    const cardWidth = isMobile ? 2.2 : 3.5
    const gap = isMobile ? 0.2 : 0.5
    const step = cardWidth + gap
    const trackSize = GALLERY_DATA.length * step

    // Physics State
    const scrollXRef = useRef(0)
    const velocityRef = useRef(0)
    const activeIndexRef = useRef(0)
    const isDragging = useRef(false)
    const lastX = useRef(0)

    // Visual State
    const [gradientColors, setGradientColors] = useState({
        r1: 10, g1: 10, b1: 10, r2: 40, g2: 10, b2: 10
    })
    const palettes = useRef<ColorPalette[]>([])
    const [transforms, setTransforms] = useState<CardTransform[]>([])

    // 1. Load Colors
    useEffect(() => {
        const loadColors = async () => {
            const promises = GALLERY_DATA.map((item, i) => {
                return new Promise<void>((resolve) => {
                    const img = new Image()
                    img.crossOrigin = 'anonymous'
                    img.onload = () => {
                        palettes.current[i] = extractColors(img, i)
                        resolve()
                    }
                    img.onerror = () => {
                        palettes.current[i] = { c1: [20, 20, 20], c2: [50, 50, 50] }
                        resolve()
                    }
                    img.src = item.src
                })
            })
            await Promise.all(promises)
            if (palettes.current[0]) {
                const p = palettes.current[0]
                setGradientColors({
                    r1: p.c1[0], g1: p.c1[1], b1: p.c1[2],
                    r2: p.c2[0], g2: p.c2[1], b2: p.c2[2]
                })
            }
        }
        loadColors()
    }, [])

    // 2. Physics Loop
    useFrame((state, delta) => {
        // Apply scroll velocity injection when in scroll zone
        const inScrollZone = scrollProgress > 0.2 && scrollProgress < 0.8

        if (!isDragging.current) {
            // Apply friction to existing velocity
            velocityRef.current *= FRICTION

            // Add auto drift when very slow and not in scroll zone
            if (Math.abs(velocityRef.current) < 0.001 && !inScrollZone) {
                velocityRef.current += 0.005
            }

            // Inject scroll-based velocity in scroll zone
            if (inScrollZone && Math.abs(scrollVelocity) > 0) {
                // Convert scroll velocity to carousel rotation
                // Scale factor determines how much scroll affects rotation
                const scrollInfluence = scrollVelocity * 0.003
                velocityRef.current += scrollInfluence
            }
        }

        // Update position based on velocity
        scrollXRef.current += velocityRef.current

        // Wrap around for infinite effect
        scrollXRef.current = mod(scrollXRef.current, trackSize)

        // Transforms
        let minDist = Infinity
        let closestIndex = 0

        const newTransforms = GALLERY_DATA.map((_, i) => {
            let pos = (i * step) - scrollXRef.current
            if (pos < -trackSize / 2) pos += trackSize
            if (pos > trackSize / 2) pos -= trackSize

            const dist = Math.abs(pos)
            if (dist < minDist) {
                minDist = dist
                closestIndex = i
            }

            const range = isMobile ? viewport.width * 0.8 : viewport.width * 0.6
            const normalizedDist = Math.max(-1, Math.min(1, pos / range))
            const rotY = normalizedDist * (isMobile ? 0.2 : 0.5)
            const scale = 1 - Math.abs(normalizedDist) * (isMobile ? 0.05 : 0.1)
            const z = Math.abs(normalizedDist) * -1.5

            return {
                position: [pos, 0, z] as [number, number, number],
                rotation: [0, rotY, 0] as [number, number, number],
                scale: scale,
                opacity: 1,
                blur: Math.abs(normalizedDist) * (isMobile ? 0 : 5)
            }
        })

        setTransforms(newTransforms)

        if (closestIndex !== activeIndexRef.current && palettes.current[closestIndex]) {
            activeIndexRef.current = closestIndex
            const p = palettes.current[closestIndex]
            setGradientColors({
                r1: p.c1[0], g1: p.c1[1], b1: p.c1[2],
                r2: p.c2[0], g2: p.c2[1], b2: p.c2[2]
            })
        }
    })

    // 3. Handlers - DRAG ONLY, NO WHEEL
    const startDrag = (clientX: number) => {
        isDragging.current = true
        lastX.current = clientX
        velocityRef.current = 0
    }

    const drag = (clientX: number) => {
        if (!isDragging.current) return
        const deltaX = clientX - lastX.current
        lastX.current = clientX
        const moveScale = viewport.width / size.width
        const moveAmount = deltaX * moveScale * DRAG_SENS
        scrollXRef.current -= moveAmount
        velocityRef.current = -moveAmount // Store velocity for momentum
    }

    const endDrag = () => {
        isDragging.current = false
        // Don't reset velocity here - let it decay naturally in the useFrame loop
    }

    // Track if global listeners are added
    const listenersAdded = useRef(false)

    // Global pointer event handlers
    const handleGlobalPointerMove = useCallback((e: PointerEvent) => {
        if (isDragging.current) {
            const deltaX = e.clientX - lastX.current
            lastX.current = e.clientX
            const moveScale = viewport.width / size.width
            const moveAmount = deltaX * moveScale * DRAG_SENS
            scrollXRef.current -= moveAmount
            velocityRef.current = -moveAmount // Update velocity for smooth momentum
        }
    }, [viewport.width, size.width])

    const handleGlobalPointerUp = useCallback(() => {
        if (isDragging.current) {
            isDragging.current = false
            // Velocity is preserved for natural deceleration
        }
    }, [])

    // Manage global listeners
    useEffect(() => {
        if (isDragging.current && !listenersAdded.current) {
            window.addEventListener('pointermove', handleGlobalPointerMove)
            window.addEventListener('pointerup', handleGlobalPointerUp)
            listenersAdded.current = true
        } else if (!isDragging.current && listenersAdded.current) {
            window.removeEventListener('pointermove', handleGlobalPointerMove)
            window.removeEventListener('pointerup', handleGlobalPointerUp)
            listenersAdded.current = false
        }

        return () => {
            if (listenersAdded.current) {
                window.removeEventListener('pointermove', handleGlobalPointerMove)
                window.removeEventListener('pointerup', handleGlobalPointerUp)
                listenersAdded.current = false
            }
        }
    }, [isDragging.current, handleGlobalPointerMove, handleGlobalPointerUp])

    return (
        <group>
            <GradientBackground colors={gradientColors} />

            {GALLERY_DATA.map((item, i) => {
                const t = transforms[i]
                if (!t) return null

                return (
                    <group
                        key={i}
                        position={t.position}
                        rotation={t.rotation}
                        scale={t.scale}
                    >
                        {/* Hit Area - This handles the drag interaction */}
                        <mesh
                            onPointerDown={(e) => {
                                e.stopPropagation()
                                startDrag(e.clientX)
                            }}
                        >
                            <planeGeometry args={[cardWidth, cardWidth * 1.3]} />
                            <meshBasicMaterial transparent opacity={0} />
                        </mesh>

                        {/* HTML Content - Clicks go through to the mesh above */}
                        <Html
                            transform
                            style={{
                                width: isMobile ? '220px' : '300px',
                                height: isMobile ? '290px' : '400px',
                                transition: 'filter 0.2s',
                                filter: `blur(${t.blur}px)`,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            }}
                            occlude
                        >
                            <div
                                className="group relative w-full h-full"
                                style={{ pointerEvents: 'none' }}
                            >
                                {/* THE IMAGE */}
                                <div className="absolute inset-0 bg-black rounded-sm overflow-hidden border border-white/10 transition-all duration-300 group-hover:border-signal/80 shadow-2xl">
                                    <img
                                        src={item.src}
                                        alt={item.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                        draggable={false}
                                    />
                                </div>

                                {/* HUD OVERLAY (No Scanlines) */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-6 h-6 border-l-2 border-t-2 border-signal" />
                                        <div className="w-6 h-6 border-r-2 border-t-2 border-signal" />
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="font-mono text-[8px] text-signal/80 leading-tight">
                                            ID: {item.title}
                                        </div>
                                        <div className="w-6 h-6 border-r-2 border-b-2 border-signal" />
                                    </div>
                                </div>
                            </div>
                        </Html>
                    </group>
                )
            })}
        </group>
    )
}