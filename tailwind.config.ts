import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                void: "#050505",       // Deep Black
                signal: "#ff2a2a",     // NGE Red
                biolum: "#00ff41",     // Hacker/HUD Green
                paper: "#f0f0f0",      // Off-white for notes
                concrete: "#8c8c8c",   // Secondary text
            },
            fontFamily: {
                serif: ["var(--font-playfair)", "serif"],
                mono: ["var(--font-space-mono)", "monospace"],
            },
            backgroundImage: {
                'grain': "url('/assets/noise.png')", // You'll need to add a noise png later
            },
            animation: {
                "flash": "flash 0.2s infinite",
                "slow-spin": "spin 20s linear infinite",
            },
            keyframes: {
                flash: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0" },
                }
            }
        },
    },
    plugins: [],
};
export default config;
