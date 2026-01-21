'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './carousel.module.css'

interface BackgroundProps {
    colors: {
        r1: number
        g1: number
        b1: number
        r2: number
        g2: number
        b2: number
    }
}

export default function GradientBackground({ colors }: BackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rafRef = useRef<number | null>(null)
    const lastDrawRef = useRef(0)
    const fastUntilRef = useRef(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) return

        // Resize canvas to match container
        const resizeCanvas = () => {
            const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
            const w = canvas.clientWidth
            const h = canvas.clientHeight
            const tw = Math.floor(w * dpr)
            const th = Math.floor(h * dpr)

            if (canvas.width !== tw || canvas.height !== th) {
                canvas.width = tw
                canvas.height = th
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            }
        }

        // Draw animated gradient background
        const drawBackground = () => {
            const now = performance.now()
            const minInterval = now < fastUntilRef.current ? 16 : 33 // 60fps or 30fps

            // Throttle rendering
            if (now - lastDrawRef.current < minInterval) {
                rafRef.current = requestAnimationFrame(drawBackground)
                return
            }

            lastDrawRef.current = now
            resizeCanvas()

            const w = canvas.clientWidth
            const h = canvas.clientHeight

            // Fill base color
            ctx.fillStyle = 'transparent'
            ctx.fillRect(0, 0, w, h)

            // Animate gradient centers
            const time = now * 0.0002
            const cx = w * 0.5
            const cy = h * 0.5
            const a1 = Math.min(w, h) * 0.35
            const a2 = Math.min(w, h) * 0.28

            // Calculate floating positions
            const x1 = cx + Math.cos(time) * a1
            const y1 = cy + Math.sin(time * 0.8) * a1 * 0.4
            const x2 = cx + Math.cos(-time * 0.9 + 1.2) * a2
            const y2 = cy + Math.sin(-time * 0.7 + 0.7) * a2 * 0.5

            const r1 = Math.max(w, h) * 0.75
            const r2 = Math.max(w, h) * 0.65

            // Use screen blending for glowing effect on dark background
            ctx.globalCompositeOperation = 'screen'

            // First radial gradient
            const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1)
            g1.addColorStop(0, `rgba(${colors.r1},${colors.g1},${colors.b1},0.6)`) // Higher opacity
            g1.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = g1
            ctx.fillRect(0, 0, w, h)

            // Second radial gradient
            const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2)
            g2.addColorStop(0, `rgba(${colors.r2},${colors.g2},${colors.b2},0.5)`) // Higher opacity
            g2.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = g2
            ctx.fillRect(0, 0, w, h)

            // Reset blending
            ctx.globalCompositeOperation = 'source-over'

            rafRef.current = requestAnimationFrame(drawBackground)
        }

        // Start animation
        rafRef.current = requestAnimationFrame(drawBackground)

        // Handle resize
        const handleResize = () => resizeCanvas()
        window.addEventListener('resize', handleResize)

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            window.removeEventListener('resize', handleResize)
        }
    }, [colors])

    // Trigger fast rendering when colors change
    useEffect(() => {
        fastUntilRef.current = performance.now() + 800
    }, [colors])

    return (
        <canvas
            ref={canvasRef}
            className={styles.background}
            aria-hidden="true"
        />
    )
}
