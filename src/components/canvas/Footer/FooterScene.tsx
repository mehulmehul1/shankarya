'use client'
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function FooterScene() {
    const { viewport } = useThree()
    const meshRef = useRef<THREE.Mesh>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        // Create video element
        const video = document.createElement('video')
        video.src = '/assets/burning-field.mp4'
        video.playsInline = true
        video.muted = true
        video.loop = true
        video.crossOrigin = 'Anonymous'

        // Store reference
        videoRef.current = video

        // Create video texture
        const videoTexture = new THREE.VideoTexture(video)
        videoTexture.minFilter = THREE.LinearFilter
        videoTexture.magFilter = THREE.LinearFilter
        videoTexture.format = THREE.RGBFormat

        // Apply texture to mesh

        if (meshRef.current) {
            const material = meshRef.current.material as THREE.MeshBasicMaterial
            material.map = videoTexture
            material.needsUpdate = true
        }

        // Try to play video
        video.play().catch(err => {
            console.log('Video autoplay failed, will play on user interaction:', err)
            // Add click listener to start video on user interaction
            const startVideo = () => {
                video.play().catch(console.error)
                document.removeEventListener('click', startVideo)
            }
            document.addEventListener('click', startVideo, { once: true })
        })

        // Cleanup
        return () => {
            video.pause()
            video.src = ''
            videoTexture.dispose()
        }
    }, [])

    // Update texture on each frame
    useFrame(() => {
        if (videoRef.current && meshRef.current) {
            const material = meshRef.current.material as THREE.MeshBasicMaterial
            if (material.map) {
                (material.map as THREE.VideoTexture).needsUpdate = true
            }
        }
    })

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <meshBasicMaterial toneMapped={false} />
        </mesh>
    )
}