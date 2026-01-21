import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        // Enable URL imports for Framer components
        urlImports: [
            "https://framer.com/m/",
            "https://framerusercontent.com/",
            "https://ga.jspm.io/",
            "https://jspm.dev/",
            "https://grainy-gradients.vercel.app/",
        ]
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
};

export default nextConfig;

