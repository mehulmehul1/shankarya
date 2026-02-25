/**
 * Asset URL resolver
 * Returns S3 CDN URL in all environments (dev and production)
 */

const ASSET_BASE_URL =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ASSET_BASE_URL) ||
    (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_ASSET_BASE_URL : '') ||
    ''

/**
 * Get asset URL
 * @param {string} path - Asset path (e.g., '/assets/archives/1.png' or just 'archives/1.png')
 * @returns {string} Full URL (S3 if configured, otherwise local /assets/ path)
 */
export function getAssetUrl(path: string): string {
    if (!path) return path

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path

    let cleanPath = path

    // Handle both formats:
    // /assets/archives/1.png → archives/1.png
    // /assets/ → empty (root assets folder)
    if (cleanPath.includes('/assets/')) {
        const parts = cleanPath.split('/assets/')
        // Keep everything after /assets/ (preserving subdirectories)
        cleanPath = parts[1] || ''
    }
    
    // Remove any leading slashes
    cleanPath = cleanPath.replace(/^\/+/, '')

    if (ASSET_BASE_URL) {
        // Ensure base URL doesn't end with slash
        const base = ASSET_BASE_URL.replace(/\/+$/, '')
        // S3 has assets/assets/... (double assets folder structure)
        return `${base}/assets/assets/${cleanPath}`
    }

    // Fallback: use local path
    return `/assets/${cleanPath}`
}
