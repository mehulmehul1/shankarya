import type { NextConfig } from "next";

const S3_BUCKET_URL = process.env.NEXT_PUBLIC_ASSET_BASE_URL || '';

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
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'shankarya.s3.eu-north-1.amazonaws.com',
                pathname: '/assets/**',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Rewrite asset requests to S3 CDN in production
    async rewrites() {
        const rewrites = [];
        if (S3_BUCKET_URL) {
            rewrites.push({
                source: '/assets/:path*',
                destination: `${S3_BUCKET_URL}/assets/:path*`,
            });
        }
        return rewrites;
    },
};

export default nextConfig;

