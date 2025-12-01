'use client'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraRigProps {
    active?: boolean
}

export default function CameraRig({ active }: CameraRigProps) {
    const { camera } = useThree()

    // Configuration
    // Default: Close up for reading text/tunnel
    const defaultPos = new THREE.Vector3(0, 0, 10)
    const defaultFov = 35

    // Active (Gallery): Pulled back, wider angle for grand view
    const activePos = new THREE.Vector3(0, 0, 15)
    const activeFov = 45

    useFrame((state, delta) => {
        const targetPos = active ? activePos : defaultPos
        const targetFov = active ? activeFov : defaultFov

        // Smooth Lerp (Damping factor 2.0)
        camera.position.lerp(targetPos, 2.0 * delta)

        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 2.0 * delta)
            camera.updateProjectionMatrix()
        }
    })

    return null
}