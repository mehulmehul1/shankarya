'use client'
import { useRef, useMemo, useState } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { useTexture, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// -------------------------------------------------------------
// 1. ROLL-UP SHADER
// -------------------------------------------------------------
const PaperMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uTime: 0,
        uProgress: 1, // Start fully rolled (1)
        uMaxAngle: Math.PI * 2.0,
        uPlaneWidth: 1.0,
        uLightDir: new THREE.Vector3(0.6, 0.8, 0.4).normalize(),
        uAmbient: 0.25,
        uSpecular: 0.25,
        uShininess: 40.0,
        uHover: 0,
        uDirection: 1.0
    },
    `
    uniform float uProgress;
    uniform float uMaxAngle;
    uniform float uPlaneWidth;
    uniform float uDirection;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPos;

    void main(){
      vUv = uv;
      vec3 pos = position;

      float rolledLen = clamp(uProgress * uPlaneWidth, 0.0, uPlaneWidth);
      float R = uPlaneWidth / uMaxAngle;

      float halfW = uPlaneWidth * 0.5;
      float boundary_x = (halfW * uDirection) - rolledLen * uDirection;

      float x_from_left = (pos.x + halfW);

      float distFromRollingEdge = (uDirection > 0.0)
        ? (uPlaneWidth - x_from_left)
        : x_from_left;

      float soft = 0.005 * uPlaneWidth;
      float inside = step(distFromRollingEdge, rolledLen);
      float blend = smoothstep(0.0, soft, rolledLen - distFromRollingEdge);

      vec3 finalPos = pos;
      vec3 flatN = vec3(0.0, 0.0, 1.0);
      vec3 outNormal = flatN;

      if (inside > 0.5) {
        float arcPos = rolledLen - distFromRollingEdge;
        float angle = arcPos / R;

        vec3 cylPos;
        cylPos.x = boundary_x + sin(angle) * R * uDirection;
        cylPos.y = pos.y;
        cylPos.z = cos(angle) * R - R;

        vec3 cylN = normalize(vec3(sin(angle) * uDirection, 0.0, cos(angle)));

        finalPos = mix(pos, cylPos, blend);
        outNormal = normalize(mix(flatN, cylN, blend));
      }

      vNormal = outNormal;
      vPos = finalPos;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
    }
  `,
    `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform vec3 uLightDir;
    uniform float uAmbient;
    uniform float uSpecular;
    uniform float uShininess;
    uniform float uTime;
    uniform float uHover;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPos;

    float random(vec2 st){ return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }

    void main(){
      vec3 n = normalize(vNormal);
      vec3 light = normalize(uLightDir);

      float diff = max(dot(n, light), 0.0);
      vec3 viewDir = normalize(-vPos);
      vec3 halfVector = normalize(light + viewDir);
      float spec = pow(max(dot(n, halfVector), 0.0), uShininess);

      vec4 tex = texture2D(uTexture, vUv);
      if (tex.a < 0.05) discard;

      float noise = random(vUv + uTime * 0.02);
      float grainStrength = 0.08 + (uHover * 0.05);

      vec3 base = tex.rgb * (uAmbient + 0.8 * diff) + uSpecular * spec;
      base -= noise * grainStrength;

      gl_FragColor = vec4(base, tex.a);
    }
  `
)
extend({ PaperMaterial })

declare module '@react-three/fiber' {
    interface ThreeElements {
        paperMaterial: any
    }
}

// -------------------------------------------------------------
// 2. ARCHIVE ITEM — unroll when entering viewport
// -------------------------------------------------------------
function ArchiveItem({ index, position, url, rotation, isLeft }: any) {
    const mesh = useRef<THREE.Mesh>(null)
    const material = useRef<any>(null)
    const [hovered, setHover] = useState(false)
    const texture = useTexture(url) as THREE.Texture

    // Grab the 3D viewport dimensions
    const { viewport } = useThree()

    const height = 3.5
    let width = 3.5

    if (texture.image) {
        const aspect = texture.image.width / texture.image.height
        width = height * aspect
    }
    if (width > 5.0) width = 5.0

    const segX = Math.max(120, Math.floor(width * 130))
    const segY = 12

    useFrame((state) => {
        if (!mesh.current || !material.current) return

        const scrollY = window.scrollY
        const vh = window.innerHeight

        const startTrigger = vh * 2.5
        const scrollSpeed = 0.012
        const activeScroll = Math.max(0, scrollY - startTrigger)
        const yOffset = activeScroll * scrollSpeed

        const currentY = position[1] + yOffset
        mesh.current.position.y = currentY

        // ----------------------------------------
        // CORRECTED VISIBILITY LOGIC
        // ----------------------------------------

        // Check if the item is within the vertical bounds of the 3D viewport
        // viewport.height is in Three.js units (unlike window.innerHeight)
        const visible = Math.abs(currentY) < (viewport.height / 2) + 1.0

        // Invert logic: 
        // If visible = true, progress should be 0 (unrolled/flat)
        // If visible = false, progress should be 1 (rolled)
        const target = visible ? 0 : 1

        material.current.uProgress = THREE.MathUtils.lerp(
            material.current.uProgress,
            target,
            0.1
        )

        material.current.uTime = state.clock.elapsedTime
        material.current.uPlaneWidth = width
        material.current.uDirection = isLeft ? -1.0 : 1.0
        material.current.uHover = THREE.MathUtils.lerp(
            material.current.uHover || 0,
            hovered ? 1 : 0,
            0.1
        )
    })

    return (
        <group position={[position[0], 0, position[2]]}>
            <mesh
                ref={mesh}
                rotation={rotation}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <planeGeometry args={[width, height, segX, segY]} />
                <paperMaterial
                    ref={material}
                    uTexture={texture}
                    uPlaneWidth={width}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    )
}

// -------------------------------------------------------------
// 3. BACKGROUND
// -------------------------------------------------------------
function BackgroundBackdrop() {
    const mesh = useRef<THREE.Mesh>(null)

    const gradientTexture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 32
        canvas.height = 1024
        const ctx = canvas.getContext('2d')!

        const g = ctx.createLinearGradient(0, 0, 0, 1024)
        g.addColorStop(0, '#050505')
        g.addColorStop(0.6, '#87ceeb')
        g.addColorStop(1, '#ffffff')

        ctx.fillStyle = g
        ctx.fillRect(0, 0, 32, 1024)

        return new THREE.CanvasTexture(canvas)
    }, [])

    useFrame(() => {
        if (!mesh.current) return

        const scrollY = window.scrollY
        const vh = window.innerHeight
        const activeScroll = Math.max(0, scrollY - (vh * 2.5))
        const startY = -70
        const moveSpeed = 0.012

        mesh.current.position.y = startY + (activeScroll * moveSpeed)
    })

    return (
        <mesh ref={mesh} position={[0, -70, -4]}>
            <planeGeometry args={[60, 120]} />
            <meshBasicMaterial map={gradientTexture} depthWrite={false} />
        </mesh>
    )
}

// -------------------------------------------------------------
// 4. MAIN COMPONENT
// -------------------------------------------------------------
export default function ArchiveTunnel() {
    const { viewport } = useThree()
    const isMobile = viewport.width < 5

    const items = useMemo(() => {
        const count = 11
        const verticalGap = 4

        return new Array(count).fill(0).map((_, i) => {
            const isLeft = i % 2 === 0

            const xDesktop = isLeft ? -2.8 : 2.8
            const xMobile = isLeft ? -0.8 : 0.8

            const x = isMobile ? xMobile : xDesktop
            const y = -8 - (i * verticalGap)
            const rotZ = (Math.random() - 0.5) * 0.1

            return {
                id: i,
                pos: [x, y, 0.5] as any,
                rot: [0, 0, rotZ] as any,
                url: `/assets/archives/${i + 1}.png`,
                isLeft
            }
        })
    }, [isMobile])

    return (
        <group>
            <BackgroundBackdrop />
            {items.map((item) => (
                <ArchiveItem
                    key={item.id}
                    index={item.id}
                    position={item.pos}
                    rotation={item.rot}
                    url={item.url}
                    isLeft={item.isLeft}
                />
            ))}
        </group>
    )
}
