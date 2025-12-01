'use client'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

// The Shader Material
const PaperShader = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uTime: 0,
        uProgress: 0, // 0 = Rolled (Far), 1 = Flat (Close)
        uSpeed: 0,    // Scroll Velocity for distortion
        uHover: 0,    // Mouse interaction
    },
    // VERTEX SHADER (The Roll Effect)
    `
    varying vec2 vUv;
    varying float vProgress;
    uniform float uTime;
    uniform float uProgress;
    uniform float uSpeed;

    const float PI = 3.14159265;

    void main() {
      vUv = uv;
      vProgress = uProgress;
      vec3 pos = position;

      // --- ROLL EFFECT ---
      // We wrap the mesh around a cylinder based on its X-axis
      // As uProgress approaches 1.0, the radius increases to infinity (flat)
      
      float radius = 0.5; // Radius of the scroll
      float angle = pos.x * PI; // Wrap logic
      
      // Calculate rolled positions (Cylinder math)
      float rolledX = radius * sin(angle);
      float rolledZ = radius * cos(angle);
      float rolledY = pos.y;

      // Mix between Rolled State and Flat State
      // Uses a non-linear mix for a "snap" feel
      float unroll = smoothstep(0.0, 1.0, uProgress);
      
      pos.x = mix(rolledX, pos.x, unroll);
      pos.z = mix(rolledZ, pos.z, unroll);
      
      // Add a slight "Wind" wave when moving fast
      pos.y += sin(pos.x * 5.0 + uTime) * uSpeed * 0.1;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    // FRAGMENT SHADER (The Grain & Distortion)
    `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uHover;
    varying vec2 vUv;
    varying float vProgress;

    // Simplex Noise (Simplified)
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;

      // --- DISTORTION ON SCROLL ---
      // Distort UVs based on scroll speed (RGB Shift setup)
      float distStrength = uSpeed * 0.2 + (uHover * 0.05);
      
      // Liquid displacement
      float wave = sin(uv.y * 10.0 + uTime * 5.0) * distStrength;
      uv.x += wave * 0.05;

      // --- CHROMATIC ABERRATION ---
      float r = texture2D(uTexture, uv + vec2(wave * 0.02, 0.0)).r;
      float g = texture2D(uTexture, uv).g;
      float b = texture2D(uTexture, uv - vec2(wave * 0.02, 0.0)).b;
      
      vec3 color = vec3(r, g, b);

      // --- FILM GRAIN ---
      float noise = random(uv + mod(uTime, 10.0));
      color -= noise * (0.15 + uSpeed * 0.2); // More grain when moving fast

      // --- VIGNETTE / ROLL SHADOW ---
      // Darken the edges if it's rolled up to simulate self-shadowing
      float rollShadow = smoothstep(0.0, 0.5, vProgress);
      color *= (0.5 + 0.5 * rollShadow);

      // Fade out if very far away (Fog)
      // float opacity = smoothstep(0.0, 0.2, vProgress);

      gl_FragColor = vec4(color, 1.0);
    }
  `
)

extend({ PaperShader })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            paperShader: any
        }
    }
}

export { PaperShader }