'use client'
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function FooterScene() {
    const { viewport } = useThree()
    const meshRef = useRef<THREE.Mesh>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = document.createElement('video')
        video.src = '/assets/burning-field.mp4'
        video.crossOrigin = 'anonymous'
        video.loop = true
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'

        videoRef.current = video

        // Debugging
        video.addEventListener('error', (e) => {
            console.error('Footer Video Error:', video.error)
        })
        video.addEventListener('loadeddata', () => {
            console.log('Footer Video Loaded')
        })

        const videoTexture = new THREE.VideoTexture(video)
        videoTexture.minFilter = THREE.LinearFilter
        videoTexture.magFilter = THREE.LinearFilter
        videoTexture.format = THREE.RGBFormat
        videoTexture.colorSpace = THREE.SRGBColorSpace // Fix bluish tint

        if (meshRef.current) {
            const material = meshRef.current.material as THREE.MeshBasicMaterial
            material.map = videoTexture
            material.needsUpdate = true
        }

        // Attempt autoplay
        video.play().catch((err) => {
            console.warn('Footer Video Autoplay blocked:', err)
            // Fallback: Play on first interaction
            const playOnClick = () => {
                video.play()
                document.removeEventListener('click', playOnClick)
            }
            document.addEventListener('click', playOnClick)
        })

        return () => {
            video.pause()
            video.src = ''
            video.remove()
            videoTexture.dispose()
        }
    }, [])

    useFrame(() => {
        if (meshRef.current?.material) {
            const mat = meshRef.current.material as THREE.MeshBasicMaterial
            if (mat.map) mat.map.needsUpdate = true
        }
    })

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <meshBasicMaterial toneMapped={false} />
        </mesh>
    )
}