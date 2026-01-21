/**
 * WebGPU Renderer Initialization
 *
 * Creates a WebGPU renderer when supported, with automatic fallback to WebGL.
 * This enables the use of TSL (Three.js Shading Language) for modern GPU shaders.
 */

import { WebGPURenderer } from 'three/webgpu'
import { WebGLRenderer } from 'three'

export type Renderer = WebGPURenderer | WebGLRenderer

export interface RendererInitResult {
    renderer: Renderer
    isWebGPU: boolean
}

/**
 * Creates a renderer with WebGPU support and WebGL fallback.
 * WebGPU enables TSL shaders, compute shaders, and better performance.
 *
 * @param canvas - The canvas element to attach to
 * @returns Promise containing the renderer and whether it's WebGPU
 */
export async function createRenderer(
    canvas: HTMLCanvasElement
): Promise<RendererInitResult> {
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

            console.log('[WebGPU] Renderer initialized successfully')

            return {
                renderer,
                isWebGPU: true,
            }
        } catch (error) {
            console.warn('[WebGPU] Initialization failed, falling back to WebGL:', error)
        }
    }

    // Fallback to WebGL
    console.log('[WebGL] Using WebGL renderer (WebGPU not available)')
    const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
    })

    return {
        renderer,
        isWebGPU: false,
    }
}

/**
 * Checks if WebGPU is supported in the current browser.
 */
export function isWebGPUSupported(): boolean {
    return 'gpu' in navigator
}

/**
 * Returns a human-readable renderer type string.
 */
export function getRendererType(isWebGPU: boolean): string {
    return isWebGPU ? 'WebGPU' : 'WebGL'
}
