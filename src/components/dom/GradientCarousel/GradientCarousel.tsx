'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import CarouselCard from './CarouselCard'
import GradientBackground from './GradientBackground'
import { extractColors, type ColorPalette } from './colorExtractor'
import styles from './carousel.module.css'

// Configuration constants
const FRICTION = 0.9
const WHEEL_SENS = 0.6
const DRAG_SENS = 1.0
const MAX_ROTATION = 28
const MAX_DEPTH = 140
const MIN_SCALE = 0.92
const SCALE_RANGE = 0.1
const GAP = 28

// GIF images from ropegifs folder
const IMAGES = [
    '/assets/ropegifs/0004.gif',
    '/assets/ropegifs/gif_5.gif',
    '/assets/ropegifs/looped.gif',
    '/assets/ropegifs/looped_4.gif',
    '/assets/ropegifs/looped_7.gif',
    '/assets/ropegifs/output_6.gif',
    '/assets/ropegifs/output_7.gif'
]

// Utility: safe modulo
function mod(n: number, m: number) {
    return ((n % m) + m) % m
}

interface CardItem {
    x: number
    transform: string
    zIndex: number
    blur: number
    opacity: number
}

export default function GradientCarousel() {
    const stageRef = useRef<HTMLDivElement>(null)
    const cardsRef = useRef<(HTMLElement | null)[]>([])
    const [cardStates, setCardStates] = useState<CardItem[]>([])

    // State
    const scrollXRef = useRef(0)
    const velocityRef = useRef(0)
    const activeIndexRef = useRef(-1)
    const isEnteringRef = useRef(true)
    const cardWidthRef = useRef(300)
    const cardHeightRef = useRef(400)
    const rafIdRef = useRef<number | null>(null)
    const lastTimeRef = useRef(0)

    // Layout
    const stepRef = useRef(GAP)
    const trackRef = useRef(0)
    const viewportHalfRef = useRef(0)

    // Dragging
    const draggingRef = useRef(false)
    const lastXRef = useRef(0)
    const lastTRef = useRef(0)
    const lastDeltaRef = useRef(0)

    // Background colors
    const [gradientColors, setGradientColors] = useState({
        r1: 5, g1: 5, b1: 5,
        r2: 10, g2: 10, b2: 10
    })
    const paletteRef = useRef<ColorPalette[]>([])

    // Calculate transform for a card position
    const transformForScreenX = useCallback((screenX: number) => {
        const norm = Math.max(-1, Math.min(1, screenX / viewportHalfRef.current))
        const absNorm = Math.abs(norm)
        const invNorm = 1 - absNorm

        const ry = -norm * MAX_ROTATION
        const tz = invNorm * MAX_DEPTH
        const scale = MIN_SCALE + invNorm * SCALE_RANGE

        return {
            transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
            z: tz,
            norm,
            absNorm,
            invNorm,
            ry,
            tz: tz,
            scale
        }
    }, [])

    // Update all card transforms
    const updateTransforms = useCallback(() => {
        const half = trackRef.current / 2
        let closestIdx = -1
        let closestDist = Infinity
        const positions = new Float32Array(IMAGES.length)

        // Calculate wrapped positions
        for (let i = 0; i < IMAGES.length; i++) {
            let pos = i * stepRef.current - scrollXRef.current

            if (pos < -half) pos += trackRef.current
            if (pos > half) pos -= trackRef.current

            positions[i] = pos

            const dist = Math.abs(pos)
            if (dist < closestDist) {
                closestDist = dist
                closestIdx = i
            }
        }

        const prevIdx = (closestIdx - 1 + IMAGES.length) % IMAGES.length
        const nextIdx = (closestIdx + 1) % IMAGES.length

        // Build card states
        const newStates: CardItem[] = []
        for (let i = 0; i < IMAGES.length; i++) {
            const pos = positions[i]
            const { transform, z, norm } = transformForScreenX(pos)

            const isCore = i === closestIdx || i === prevIdx || i === nextIdx
            const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1)

            newStates.push({
                x: pos,
                transform,
                zIndex: 1000 + Math.round(z),
                blur,
                opacity: 1
            })
        }

        setCardStates(newStates)

        // Update gradient if active card changed
        if (closestIdx !== activeIndexRef.current && closestIdx >= 0) {
            activeIndexRef.current = closestIdx
            const pal = paletteRef.current[closestIdx]
            if (pal) {
                const target = {
                    r1: pal.c1[0],
                    g1: pal.c1[1],
                    b1: pal.c1[2],
                    r2: pal.c2[0],
                    g2: pal.c2[1],
                    b2: pal.c2[2],
                }
                gsap.to(gradientColors, {
                    ...target,
                    duration: 0.45,
                    ease: 'power2.out',
                    onUpdate: () => setGradientColors({ ...gradientColors })
                })
            }
        }
    }, [transformForScreenX, gradientColors])

    // Animation loop
    useEffect(() => {
        const tick = (t: number) => {
            const dt = lastTimeRef.current ? (t - lastTimeRef.current) / 1000 : 0
            lastTimeRef.current = t

            // Apply velocity
            scrollXRef.current = mod(scrollXRef.current + velocityRef.current * dt, trackRef.current)

            // Apply friction
            const decay = Math.pow(FRICTION, dt * 60)
            velocityRef.current *= decay
            if (Math.abs(velocityRef.current) < 0.02) velocityRef.current = 0

            updateTransforms()
            rafIdRef.current = requestAnimationFrame(tick)
        }

        rafIdRef.current = requestAnimationFrame(tick)
        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
        }
    }, [updateTransforms])

    // Wheel handler
    useEffect(() => {
        const stage = stageRef.current
        if (!stage) return

        const handleWheel = (e: WheelEvent) => {
            if (isEnteringRef.current) return
            e.preventDefault()

            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
            velocityRef.current += delta * WHEEL_SENS * 20
        }

        stage.addEventListener('wheel', handleWheel, { passive: false })
        return () => stage.removeEventListener('wheel', handleWheel)
    }, [])

    // Drag handlers
    useEffect(() => {
        const stage = stageRef.current
        if (!stage) return

        const handlePointerDown = (e: PointerEvent) => {
            if (isEnteringRef.current) return
            draggingRef.current = true
            lastXRef.current = e.clientX
            lastTRef.current = performance.now()
            lastDeltaRef.current = 0
            stage.setPointerCapture(e.pointerId)
            stage.classList.add(styles.dragging)
        }

        const handlePointerMove = (e: PointerEvent) => {
            if (!draggingRef.current) return

            const now = performance.now()
            const dx = e.clientX - lastXRef.current
            const dt = Math.max(1, now - lastTRef.current) / 1000

            scrollXRef.current = mod(scrollXRef.current - dx * DRAG_SENS, trackRef.current)
            lastDeltaRef.current = dx / dt
            lastXRef.current = e.clientX
            lastTRef.current = now
        }

        const handlePointerUp = (e: PointerEvent) => {
            if (!draggingRef.current) return
            draggingRef.current = false
            stage.releasePointerCapture(e.pointerId)
            velocityRef.current = -lastDeltaRef.current * DRAG_SENS
            stage.classList.remove(styles.dragging)
        }

        stage.addEventListener('pointerdown', handlePointerDown)
        stage.addEventListener('pointermove', handlePointerMove)
        stage.addEventListener('pointerup', handlePointerUp)
        stage.addEventListener('dragstart', (e) => e.preventDefault())

        return () => {
            stage.removeEventListener('pointerdown', handlePointerDown)
            stage.removeEventListener('pointermove', handlePointerMove)
            stage.removeEventListener('pointerup', handlePointerUp)
        }
    }, [])

    // Resize handler
    useEffect(() => {
        const measure = () => {
            if (cardsRef.current[0]) {
                const rect = cardsRef.current[0].getBoundingClientRect()
                cardWidthRef.current = rect.width || 300
                cardHeightRef.current = rect.height || 400
            }

            stepRef.current = cardWidthRef.current + GAP
            trackRef.current = IMAGES.length * stepRef.current
            viewportHalfRef.current = window.innerWidth * 0.5

            updateTransforms()
        }

        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [updateTransforms])

    // Initialize - load images and extract colors
    useEffect(() => {
        const init = async () => {
            // Wait for all images to load
            const promises = IMAGES.map((src) => {
                return new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image()
                    img.onload = () => resolve(img)
                    img.onerror = reject
                    img.src = src
                })
            })

            const images = await Promise.all(promises)

            // Extract colors
            paletteRef.current = images.map((img, i) => extractColors(img, i))

            // Set initial gradient
            if (paletteRef.current[0]) {
                setGradientColors({
                    r1: paletteRef.current[0].c1[0],
                    g1: paletteRef.current[0].c1[1],
                    b1: paletteRef.current[0].c1[2],
                    r2: paletteRef.current[0].c2[0],
                    g2: paletteRef.current[0].c2[1],
                    b2: paletteRef.current[0].c2[2],
                })
            }

            // Entry animation
            await new Promise(r => requestAnimationFrame(r))

            // Simple fade-in for cards
            await new Promise(r => setTimeout(r, 100))
            isEnteringRef.current = false
        }

        init()
    }, [])

    return (
        <div ref={stageRef} className={styles.stage}>
            <GradientBackground colors={gradientColors} />

            <section className={styles.cardsContainer}>
                {IMAGES.map((src, i) => (
                    <CarouselCard
                        key={i}
                        ref={(el) => { cardsRef.current[i] = el }}
                        src={src}
                        transform={cardStates[i]?.transform || 'translate3d(0,0,0)'}
                        zIndex={cardStates[i]?.zIndex || 1000}
                        blur={cardStates[i]?.blur || 0}
                        style={{
                            opacity: cardStates[i]?.opacity || 0
                        }}
                    />
                ))}
            </section>
        </div>
    )
}
