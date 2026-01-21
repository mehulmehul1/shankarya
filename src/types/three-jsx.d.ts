import * as THREE from 'three'
import { ReactThreeFiber } from '@react-three/fiber'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            footerMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial> & {
                uTexture?: THREE.Texture
                uTint?: THREE.Color
                uThreshold?: number
                uIntensity?: number
                toneMapped?: boolean
            }
        }
    }
}
