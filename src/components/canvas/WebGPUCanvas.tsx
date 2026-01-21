'use client'
import { Canvas } from '@react-three/fiber'
import { ReactNode, forwardRef, useEffect, useRef } from 'react'
import { WebGPURenderer } from 'three/webgpu'
import { WebGLRenderer } from 'three'

interface WebGPUCanvasProps {
    children: ReactNode
    className?: string
    dpr?: number | [number, number]
    camera?: { position: [number, number, number]; fov: number }
}

/**
 * WebGPU-enabled Canvas component with automatic WebGL fallback.
 *
 * This component initializes a WebGPU renderer when available, falling back
 * to WebGL for unsupported browsers. It handles the async renderer.init()
 * required for WebGPU.
 */
export const WebGPUCanvas = forwardRef<HTMLCanvasElement, WebGPUCanvasProps>(
    ({ children, className, dpr = [1, 2], camera }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null)
        const rendererRef = useRef<WebGPURenderer | WebGLRenderer | null>(null)
        const isWebGPURef = useRef<boolean>(false)

        // Expose the canvas ref to parent
        useEffect(() => {
            if (ref && typeof ref === 'object' && canvasRef.current) {
                ref.current = canvasRef.current
            }
        }, [ref])

        // Initialize WebGPU renderer
        useEffect(() => {
            const canvas = canvasRef.current
            if (!canvas) return

            const initRenderer = async () => {
                // Check if WebGPU is available
                if (navigator.gpu) {
                    try {
                        const renderer = new WebGPURenderer({
                            canvas,
                            antialias: true,
                            alpha: true,
                            powerPreference: 'high-performance',
                        })

                        // CRITICAL: Must await init() before first render with WebGPU
                        await renderer.init()

                        rendererRef.current = renderer
                        isWebGPURef.current = true

                        console.log('[WebGPU] Renderer initialized successfully')
                        return
                    } catch (error) {
                        console.warn('[WebGPU] Initialization failed, falling back to WebGL:', error)
                    }
                }

                // Fallback to WebGL
                const renderer = new WebGLRenderer({
                    canvas,
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                })

                rendererRef.current = renderer
                isWebGPURef.current = false

                console.log('[WebGL] Using WebGL renderer (WebGPU not available)')
            }

            initRenderer()

            return () => {
                // Cleanup renderer on unmount
                if (rendererRef.current) {
                    rendererRef.current.dispose()
                }
            }
        }, [])

        return (
            <Canvas
                ref={canvasRef}
                className={className}
                dpr={dpr}
                camera={camera}
                gl={{ alpha: true, antialias: true }}
            >
                {children}
            </Canvas>
        )
    }
)

WebGPUCanvas.displayName = 'WebGPUCanvas'
