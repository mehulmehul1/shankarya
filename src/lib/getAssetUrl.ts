/**
 * Asset URL resolver
 * Returns S3 CDN URL in production, local path in development
 */

const ASSET_BASE_URL = process.env.NEXT_PUBLIC_ASSET_BASE_URL || ''

/**
 * Get asset URL
 * @param {string} path - Asset path relative to /assets/ (e.g., 'archives/1.png')
 * @returns {string} Full URL (S3 in prod, /assets/ in dev)
 */
export function getAssetUrl(path: string): string {
    if (ASSET_BASE_URL) {
        // Production: use S3 CDN
        const cleanPath = path.replace(/^\/+/, '')
        return `${ASSET_BASE_URL}/assets/${cleanPath}`
    }

    // Development: use local path
    return `/assets/${path}`
}
