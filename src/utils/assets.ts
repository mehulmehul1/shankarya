const ASSET_BASE_URL =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ASSET_BASE_URL) ||
    (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_ASSET_BASE_URL : '') ||
    '';

/**
 * Resolves a local asset path to its S3 counterpart.
 * @param path The local path (e.g., '/assets/hero.mp4')
 * @returns The S3 URL if configured, otherwise original path.
 */
export const getAssetUrl = (path: string): string => {
    if (!path) return path;

    // If path already has a protocol, return as is
    if (path.startsWith('http')) return path;

    // Prepend S3 base URL if it exists
    // S3 files are at assets/assets/... (double assets folder)
    if (ASSET_BASE_URL && path.startsWith('/assets/')) {
        const normalizedBase = ASSET_BASE_URL.endsWith('/') ? ASSET_BASE_URL.slice(0, -1) : ASSET_BASE_URL;
        // Remove leading slash and add /assets/assets/ prefix
        const cleanPath = path.replace(/^\/+/, '');
        return `${normalizedBase}/assets/assets/${cleanPath}`;
    }

    return path;
};
