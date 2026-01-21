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

// Physics constants
const FRICTION = 0.96
const DRAG_SENS = 1.8
const AUTO_ROTATE_SPEED = 0.001
const SCROLL_SENS = 0.02

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

export default function GifCarousel() {
    const { viewport, size, gl } = useThree()
    const setCursorText = useStore((state) => state.setCursorText)
    const domElement = gl.domElement

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
    const lastTime = useRef(0)

    // Visual State
    const [gradientColors, setGradientColors] = useState({
        r1: 10, g1: 10, b1: 10, r2: 40, g2: 10, b2: 10
    })
    const palettes = useRef<ColorPalette[]>([])
    const [transforms, setTransforms] = useState<CardTransform[]>([])
    const [imagesLoaded, setImagesLoaded] = useState(false)

    // 1. Load Colors and preload images
    useEffect(() => {
        const loadColors = async () => {
            // Check if we're in a browser environment
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                // Use fallback colors for server-side rendering
                GALLERY_DATA.forEach((_, i) => {
                    const h = (i * 37) % 360;
                    const s = 0.65;
                    const c1 = [Math.round(255 * (0.5 - 0.5 * s * Math.cos((h * Math.PI) / 180))),
                              Math.round(255 * (0.5 - 0.5 * s * Math.cos(((h + 120) * Math.PI) / 180))),
                              Math.round(255 * (0.5 - 0.5 * s * Math.cos(((h + 240) * Math.PI) / 180)))];
                    const c2 = c1.map(c => Math.min(255, c + 30)) as number[];
                    palettes.current[i] = { c1, c2 };
                });
                setImagesLoaded(true);
                return;
            }

            const promises = GALLERY_DATA.map((item, i) => {
                return new Promise<void>((resolve) => {
                    const img = new Image()
                    img.crossOrigin = 'anonymous'
                    img.onload = () => {
                        try {
                            palettes.current[i] = extractColors(img, i)
                        } catch (e) {
                            console.warn('Color extraction failed for', item.src, e)
                            // Use fallback colors
                            const h = (i * 37) % 360
                            palettes.current[i] = {
                                c1: [Math.round(128 + 127 * Math.sin(h)),
                                     Math.round(128 + 127 * Math.sin(h + 2)),
                                     Math.round(128 + 127 * Math.sin(h + 4))],
                                c2: [Math.round(128 + 127 * Math.sin(h + 3)),
                                     Math.round(128 + 127 * Math.sin(h + 5)),
                                     Math.round(128 + 127 * Math.sin(h + 1))]
                            }
                        }
                        resolve()
                    }
                    img.onerror = () => {
                        palettes.current[i] = {
                            c1: [20 + i * 10, 20 + i * 5, 30 + i * 8],
                            c2: [40 + i * 15, 40 + i * 10, 50 + i * 12]
                        }
                        resolve()
                    }
                    img.src = item.src
                })
            })

            await Promise.all(promises)

            // Preload all images to prevent flickering
            const preloadPromises = GALLERY_DATA.map(item => {
                return new Promise<void>((resolve) => {
                    const img = new Image()
                    img.onload = () => resolve()
                    img.onerror = () => resolve()
                    img.src = item.src
                })
            })

            await Promise.all(preloadPromises)
            setImagesLoaded(true)

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

    // 2. Global wheel handler
    useEffect(() => {
        if (!domElement) return

        const handleWheel = (e: WheelEvent) => {
            // Check if mouse is over the carousel area (middle of screen)
            const rect = domElement.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top
            const centerX = rect.width / 2
            const centerY = rect.height / 2

            // Define carousel area (center 60% of the viewport)
            const carouselWidth = rect.width * 0.8
            const carouselHeight = rect.height * 0.6

            // Check if mouse is within carousel bounds
            if (Math.abs(mouseX - centerX) < carouselWidth / 2 &&
                Math.abs(mouseY - centerY) < carouselHeight / 2) {
                e.preventDefault()
                e.stopPropagation()

                // Convert wheel to horizontal rotation
                const delta = e.deltaY || e.deltaX
                velocityRef.current += delta * SCROLL_SENS
            }
        }

        // Add wheel listener with capture to ensure it gets the event first
        domElement.addEventListener('wheel', handleWheel, { passive: false, capture: true })

        return () => {
            domElement.removeEventListener('wheel', handleWheel, { capture: true })
        }
    }, [domElement])

    // 3. Physics Loop
    useFrame((state, delta) => {
        if (!imagesLoaded) return

        // Apply friction
        velocityRef.current *= Math.pow(FRICTION, delta * 60)

        // Auto-rotate only when completely idle
        if (Math.abs(velocityRef.current) < 0.0005 && !isDragging.current) {
            velocityRef.current = AUTO_ROTATE_SPEED
        }

        // Update position
        scrollXRef.current += velocityRef.current

        // Smooth wrapping
        scrollXRef.current = mod(scrollXRef.current, trackSize)

        // Calculate transforms
        let minDist = Infinity
        let closestIndex = 0

        const newTransforms = GALLERY_DATA.map((_, i) => {
            let pos = (i * step) - scrollXRef.current

            // Smooth wrap at boundaries
            if (pos < -trackSize / 2) pos += trackSize
            if (pos > trackSize / 2) pos -= trackSize

            const dist = Math.abs(pos)
            if (dist < minDist) {
                minDist = dist
                closestIndex = i
            }

            // Smoother visual effects
            const range = viewport.width * (isMobile ? 0.7 : 0.5)
            const normalizedDist = Math.max(-1, Math.min(1, pos / range))

            // Use smoother curves
            const distFactor = Math.pow(Math.abs(normalizedDist), 1.5)
            const rotY = normalizedDist * (isMobile ? 0.3 : 0.6) * (1 - distFactor * 0.3)
            const scale = 1 - distFactor * (isMobile ? 0.08 : 0.15)
            const z = distFactor * -1.5

            return {
                position: [pos, 0, z] as [number, number, number],
                rotation: [0, rotY, 0] as [number, number, number],
                scale: scale,
                opacity: 1 - distFactor * 0.3,
                blur: distFactor * (isMobile ? 0 : 4)
            }
        })

        setTransforms(newTransforms)

        // Update gradient colors
        if (closestIndex !== activeIndexRef.current && palettes.current[closestIndex]) {
            activeIndexRef.current = closestIndex
            const p = palettes.current[closestIndex]
            setGradientColors({
                r1: p.c1[0], g1: p.c1[1], b1: p.c1[2],
                r2: p.c2[0], g2: p.c2[1], b2: p.c2[2]
            })
        }
    })

    // 4. Drag handlers
    const startDrag = useCallback((clientX: number) => {
        isDragging.current = true
        lastX.current = clientX
        lastTime.current = performance.now()
        velocityRef.current = 0
        setCursorText('DRAGGING')
    }, [setCursorText])

    const drag = useCallback((clientX: number) => {
        if (!isDragging.current) return

        const now = performance.now()
        const dt = Math.max(1, now - lastTime.current)
        const deltaX = clientX - lastX.current

        lastX.current = clientX
        lastTime.current = now

        const moveScale = viewport.width / size.width
        const moveAmount = deltaX * moveScale * DRAG_SENS

        scrollXRef.current -= moveAmount
        velocityRef.current = -(moveAmount / dt) * 60
    }, [viewport.width, size.width])

    const endDrag = useCallback(() => {
        if (!isDragging.current) return
        isDragging.current = false
        setCursorText('')
    }, [setCursorText])

    // 5. Global event handling
    useEffect(() => {
        const handleGlobalPointerMove = (e: PointerEvent) => {
            if (isDragging.current) {
                drag(e.clientX)
            }
        }

        const handleGlobalPointerUp = () => {
            endDrag()
        }

        if (isDragging.current) {
            window.addEventListener('pointermove', handleGlobalPointerMove)
            window.addEventListener('pointerup', handleGlobalPointerUp)
            document.body.style.userSelect = 'none'
        }

        return () => {
            window.removeEventListener('pointermove', handleGlobalPointerMove)
            window.removeEventListener('pointerup', handleGlobalPointerUp)
            document.body.style.userSelect = ''
        }
    }, [drag, endDrag])

    return (
        <group>
            <GradientBackground colors={gradientColors} />

            {GALLERY_DATA.map((item, i) => {
                const t = transforms[i]
                if (!t || !imagesLoaded) return null

                return (
                    <group
                        key={i}
                        position={t.position}
                        rotation={t.rotation}
                        scale={t.scale}
                    >
                        {/* Hit Area */}
                        <mesh
                            onPointerDown={(e) => {
                                e.stopPropagation()
                                startDrag(e.clientX)
                            }}
                            onPointerEnter={() => {
                                if (!isDragging.current) {
                                    setCursorText('DRAG')
                                }
                            }}
                            onPointerLeave={() => {
                                if (!isDragging.current) {
                                    setCursorText('')
                                }
                            }}
                        >
                            <planeGeometry args={[cardWidth * 1.3, cardWidth * 1.6]} />
                            <meshBasicMaterial transparent opacity={0} />
                        </mesh>

                        {/* HTML Content */}
                        <Html
                            transform
                            style={{
                                width: isMobile ? '220px' : '300px',
                                height: isMobile ? '290px' : '400px',
                                transition: 'none',
                                filter: `blur(${t.blur}px)`,
                                pointerEvents: 'none',
                                userSelect: 'none',
                                opacity: t.opacity,
                                transform: 'translateZ(0)'
                            }}
                            occlude={false}
                        >
                            <div
                                className="relative w-full h-full"
                                style={{ pointerEvents: 'none' }}
                            >
                                {/* Ensure GIF is always loaded and visible */}
                                <div className="absolute inset-0 bg-black rounded-sm overflow-hidden border border-white/10">
                                    <img
                                        src={item.src}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                        style={{
                                            opacity: 0.95,
                                            willChange: 'transform'
                                        }}
                                    />
                                </div>

                                {/* Always visible HUD */}
                                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                                    <div className="flex justify-between items-start">
                                        <div className="w-6 h-6 border-l border-t border-signal/50" />
                                        <div className="w-6 h-6 border-r border-t border-signal/50" />
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="font-mono text-[10px] text-signal/70 leading-tight tracking-wider">
                                            ID: {item.title}
                                        </div>
                                        <div className="w-2 h-2 bg-signal/50 rounded-full" />
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