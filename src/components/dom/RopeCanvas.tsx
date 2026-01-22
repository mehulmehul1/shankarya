'use client'
import { useRef, useEffect, useState } from 'react'
import { getAssetUrl } from '@/lib/getAssetUrl'

type Pt = { x: number; y: number; px: number; py: number }
type Disk = { x: number; y: number; r: number }

interface RopeCanvasProps {
    svgPath?: string
    ropeColor?: string
    ropeThickness?: number
    gravity?: number
    debug?: boolean
    damping?: number
    iterations?: number
    substeps?: number
    colliderStroke?: number
    samplesPer100px?: number
    maxDisks?: number
    showCollider?: boolean
    autoFit?: boolean
    fitFillPercent?: number
}

// Configuration for the attached GIFs
const GIF_COUNT = 7
const GIF_OFFSET_DISTANCE = 40 // How far from the rope they hang
const GIF_SIZE = 60 // Size in px
const GIF_FILES = [
    '0004.gif',
    'gif_5.gif',
    'looped.gif',
    'looped_4.gif',
    'looped_7.gif',
    'output_6.gif',
    'output_7.gif'
]

export default function RopeCanvas({
    svgPath = '/assets/tree2.svg',
    ropeColor = '#e0e0e0',
    ropeThickness = 6,
    gravity = 0.6,
    debug = false,
    damping = 0.92,
    iterations = 6,
    substeps = 1,
    colliderStroke = 5,
    samplesPer100px = 14,
    maxDisks = 1200,
    showCollider = false,
    autoFit = true,
    fitFillPercent = 0.7
}: RopeCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gifsRef = useRef<(HTMLImageElement | null)[]>([])

    // Logic Refs
    const ptsRef = useRef<Pt[]>([])
    const disksRef = useRef<Disk[]>([])

    // Config
    const config = useRef({
        simSteps: 10,
        iterations: iterations,
        segmentLength: 4,
        damping: damping,
    })

    const mouse = useRef({ x: 0, y: 0, down: false })
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 })
    const [isLoaded, setIsLoaded] = useState(false)

    // 1. Load SVG
    useEffect(() => {
        async function load() {
            try {
                if (!canvasRef.current) return
                const res = await fetch(svgPath)
                const text = await res.text()
                const parser = new DOMParser()
                const doc = parser.parseFromString(text, 'image/svg+xml')
                const svgPaths = Array.from(doc.querySelectorAll('path'))

                const pathStrings = svgPaths.map(p => p.getAttribute('d') || '')
                // @ts-ignore
                canvasRef.current.__rawPaths = pathStrings
                setIsLoaded(true)
            } catch (e) {
                console.error("SVG Load Error:", e)
            }
        }
        load()
    }, [svgPath])

    // 2. Handle Resize & Setup
    useEffect(() => {
        if (!containerRef.current || !canvasRef.current || !isLoaded) return

        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect
            if (width === 0 || height === 0) return

            setDimensions({ w: width, h: height })
            const canvas = canvasRef.current!
            canvas.width = width
            canvas.height = height

            // @ts-ignore
            const rawPaths: string[] = canvas.__rawPaths || []
            disksRef.current = []

            // Bounding Box Logic (Same as before)
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = `<svg><path d="" /></svg>`
            const tempPath = tempDiv.querySelector('path')!

            rawPaths.forEach(d => {
                tempPath.setAttribute('d', d)
                if (tempPath.getTotalLength() === 0) return
                const len = tempPath.getTotalLength()
                for (let i = 0; i <= 20; i++) {
                    const p = tempPath.getPointAtLength(len * (i / 20))
                    minX = Math.min(minX, p.x)
                    maxX = Math.max(maxX, p.x)
                    minY = Math.min(minY, p.y)
                    maxY = Math.max(maxY, p.y)
                }
            })

            if (minX === Infinity) return

            const bboxW = maxX - minX
            const bboxH = maxY - minY

            // Responsive Logic
            const isMobile = width < 768
            const scaleFactor = isMobile ? 0.9 : 0.85
            const scale = Math.min((width * scaleFactor) / bboxW, (height * scaleFactor) / bboxH)
            const targetCenterX = isMobile ? width * 0.5 : width * 0.75
            const currentCenterX = minX * scale + (bboxW * scale) / 2
            const offsetX = targetCenterX - currentCenterX
            const offsetY = (height - bboxH * scale) / 2 - minY * scale

            const colliderRadius = 8 * scale

            rawPaths.forEach(d => {
                tempPath.setAttribute('d', d)
                const totalLen = tempPath.getTotalLength()
                if (totalLen === 0) return
                const step = colliderRadius * 0.6
                for (let i = 0; i < totalLen; i += step) {
                    const p = tempPath.getPointAtLength(i)
                    disksRef.current.push({
                        x: p.x * scale + offsetX,
                        y: p.y * scale + offsetY,
                        r: colliderRadius
                    })
                }
            })

            // @ts-ignore
            canvas.__transform = { scale, offsetX, offsetY, rawPaths }

            // Init Rope - SHORTER NOW
            if (ptsRef.current.length === 0) {
                const ropeLen = isMobile ? height * 0.35 : height * 0.5
                const segLen = config.current.segmentLength
                const numSegs = Math.floor(ropeLen / segLen)
                ptsRef.current = []
                const startX = width * 0.2
                for (let i = 0; i < numSegs; i++) {
                    ptsRef.current.push({
                        x: startX,
                        y: 50 + i * segLen,
                        px: startX,
                        py: 50 + i * segLen
                    })
                }
            }
        })

        resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
    }, [isLoaded])


    // 3. Physics & Render Loop
    useEffect(() => {
        if (!dimensions.w) return

        let rafId: number
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!

        const loop = () => {
            const { w, h } = dimensions
            ctx.clearRect(0, 0, w, h)

            // --- DRAW TREE ---
            // @ts-ignore
            const tf = canvas.__transform
            if (tf) {
                ctx.save()
                ctx.translate(tf.offsetX, tf.offsetY)
                ctx.scale(tf.scale, tf.scale)
                ctx.strokeStyle = "#050505"
                ctx.lineWidth = 1.5 / tf.scale
                ctx.lineJoin = 'round'
                ctx.lineCap = 'round'
                tf.rawPaths.forEach((d: string) => {
                    const p = new Path2D(d)
                    ctx.stroke(p)
                })
                ctx.restore()
            }

            // --- PHYSICS STEPS (Same as before) ---
            const pts = ptsRef.current
            const disks = disksRef.current
            const { simSteps, iterations, segmentLength, damping } = config.current

            if (pts.length > 0) {
                for (let step = 0; step < simSteps; step++) {
                    for (let i = 0; i < pts.length; i++) {
                        const p = pts[i]
                        const vx = (p.x - p.px) * damping
                        const vy = (p.y - p.py) * damping + gravity
                        p.px = p.x; p.py = p.y; p.x += vx; p.y += vy
                        if (p.y > h) { p.y = h; p.py = p.y; }
                    }

                    if (mouse.current.down) {
                        pts[0].x = mouse.current.x
                        pts[0].y = mouse.current.y
                        pts[0].px = pts[0].x; pts[0].py = pts[0].y
                    }

                    for (let iter = 0; iter < iterations; iter++) {
                        // Constraints
                        for (let i = 0; i < pts.length - 1; i++) {
                            const a = pts[i]; const b = pts[i + 1]
                            const dx = b.x - a.x; const dy = b.y - a.y
                            const dist = Math.hypot(dx, dy)
                            const diff = dist - segmentLength
                            if (dist > 0.01) {
                                const offX = (dx / dist) * diff * 0.5
                                const offY = (dy / dist) * diff * 0.5
                                if (i === 0 && mouse.current.down) {
                                    b.x -= offX * 2; b.y -= offY * 2
                                } else {
                                    a.x += offX; a.y += offY; b.x -= offX; b.y -= offY
                                }
                            }
                        }
                        // Collisions
                        for (let i = 0; i < pts.length; i++) {
                            const p = pts[i]
                            for (let j = 0; j < disks.length; j++) {
                                const d = disks[j]
                                const dx = p.x - d.x; const dy = p.y - d.y
                                if (Math.abs(dx) > d.r || Math.abs(dy) > d.r) continue
                                if ((dx * dx + dy * dy) < d.r * d.r) {
                                    const dist = Math.sqrt(dx * dx + dy * dy)
                                    const pen = d.r - dist
                                    p.x += (dx / dist) * pen; p.y += (dy / dist) * pen
                                    const vx = p.x - p.px; const vy = p.y - p.py
                                    p.px = p.x - vx * 0.6; p.py = p.y - vy * 0.6
                                }
                            }
                        }
                    }
                }

                // --- DRAW ROPE ---
                const drawCurve = () => {
                    ctx.beginPath()
                    ctx.moveTo(pts[0].x, pts[0].y)
                    for (let i = 1; i < pts.length - 1; i++) {
                        const xc = (pts[i].x + pts[i + 1].x) / 2
                        const yc = (pts[i].y + pts[i + 1].y) / 2
                        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
                    }
                    const last = pts[pts.length - 1]
                    ctx.lineTo(last.x, last.y)
                }

                ctx.lineCap = 'round'; ctx.lineJoin = 'round'
                drawCurve(); ctx.strokeStyle = "#000000"; ctx.lineWidth = ropeThickness + 3; ctx.stroke()
                drawCurve(); ctx.strokeStyle = ropeColor; ctx.lineWidth = ropeThickness; ctx.stroke()
                drawCurve(); ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = ropeThickness - 2
                ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([])

                // --- UPDATE GIFS (SYNC) - TIGHTER SPACING ---
                const totalLen = pts.length
                // Distribute 7 GIFs evenly along the bottom 85% of the rope
                const step = Math.floor((totalLen * 0.85) / GIF_COUNT)
                const startIdx = Math.floor(totalLen * 0.1) // Skip top 10%

                gifsRef.current.forEach((img, i) => {
                    if (!img) return

                    // Determine rope index
                    const ropeIdx = startIdx + i * step
                    if (ropeIdx >= pts.length - 1) return

                    const p = pts[ropeIdx]
                    const nextP = pts[ropeIdx + 1]

                    // Calculate Angle
                    const dx = nextP.x - p.x
                    const dy = nextP.y - p.y
                    const angle = Math.atan2(dy, dx)

                    // Alternate Sides (Left / Right)
                    const side = i % 2 === 0 ? 1 : -1

                    // Calculate Normal Vector (Perpendicular) for offset
                    // Normal of (dx, dy) is (-dy, dx)
                    const nx = -dy
                    const ny = dx
                    // Normalize
                    const len = Math.hypot(nx, ny) || 1

                    const offsetX = (nx / len) * GIF_OFFSET_DISTANCE * side
                    const offsetY = (ny / len) * GIF_OFFSET_DISTANCE * side

                    // Final Position
                    const finalX = p.x + offsetX
                    const finalY = p.y + offsetY

                    // 1. Draw Connector Line (Canvas)
                    ctx.beginPath()
                    ctx.moveTo(p.x, p.y)
                    ctx.lineTo(finalX, finalY)
                    ctx.strokeStyle = "#555" // Dark grey string
                    ctx.lineWidth = 1
                    ctx.stroke()

                    // 2. Update DOM Element (HTML)
                    // We use translate3d for GPU acceleration
                    img.style.transform = `
                        translate3d(${finalX - GIF_SIZE / 2}px, ${finalY - GIF_SIZE / 2}px, 0) 
                        rotate(${angle + (side * 0.2)}rad)
                    `
                })
            }

            rafId = requestAnimationFrame(loop)
        }

        loop()
        return () => cancelAnimationFrame(rafId)
    }, [dimensions, debug, gravity, ropeColor, ropeThickness])

    const onMove = (e: React.PointerEvent) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
            mouse.current.x = e.clientX - rect.left
            mouse.current.y = e.clientY - rect.top
        }
    }

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full touch-none z-20 overflow-hidden"
            onPointerDown={(e) => { onMove(e); mouse.current.down = true }}
            onPointerMove={onMove}
            onPointerUp={() => mouse.current.down = false}
            onPointerLeave={() => mouse.current.down = false}
        >
            <canvas ref={canvasRef} className="block w-full h-full" />

            {/* Render GIF Elements */}
            {GIF_FILES.map((gifFile, i) => (
                <img
                    key={i}
                    ref={(el) => { gifsRef.current[i] = el }}
                    src={getAssetUrl(`/assets/ropegifs/${gifFile}`)}
                    alt="archive"
                    className="absolute pointer-events-none select-none border border-white/20 shadow-lg bg-black"
                    style={{
                        width: GIF_SIZE,
                        height: GIF_SIZE,
                        objectFit: 'cover',
                        willChange: 'transform',
                        top: 0,
                        left: 0,
                        // Initial position off-screen until physics update
                        transform: 'translate3d(-1000px, -1000px, 0)'
                    }}
                />
            ))}
        </div>
    )
}