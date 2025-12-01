/**
 * Color extraction utilities for gradient carousel
 * Based on histogram analysis of image pixels
 */

export interface ColorPalette {
    c1: number[]; // Primary RGB color
    c2: number[]; // Secondary RGB color
}

/**
 * Convert RGB to HSL color space
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
        h = 0;
        s = 0; // Achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            default:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h * 360, s, l];
}

/**
 * Convert HSL to RGB color space
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h = ((h % 360) + 360) % 360;
    h /= 360;
    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l; // Achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Generate fallback colors when extraction fails
 */
function fallbackFromIndex(idx: number): ColorPalette {
    const h = (idx * 37) % 360; // Spread hues across spectrum
    const s = 0.65;
    const c1 = hslToRgb(h, s, 0.52);
    const c2 = hslToRgb(h, s, 0.72);
    return { c1, c2 };
}

/**
 * Extract dominant colors from an image using histogram analysis
 */
export function extractColors(img: HTMLImageElement, idx: number): ColorPalette {
    try {
        // Downscale image for faster processing
        const MAX = 48;
        const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
        const tw = ratio >= 1 ? MAX : Math.max(16, Math.round(MAX * ratio));
        const th = ratio >= 1 ? Math.max(16, Math.round(MAX / ratio)) : MAX;

        // Draw image to temporary canvas
        const canvas = document.createElement('canvas');
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext('2d');
        if (!ctx) return fallbackFromIndex(idx);

        ctx.drawImage(img, 0, 0, tw, th);
        const data = ctx.getImageData(0, 0, tw, th).data;

        // Create 2D histogram bins (hue × saturation)
        const H_BINS = 36; // 10° hue increments
        const S_BINS = 5;  // 20% saturation increments
        const SIZE = H_BINS * S_BINS;
        const wSum = new Float32Array(SIZE); // Weighted pixel count
        const rSum = new Float32Array(SIZE); // Weighted red sum
        const gSum = new Float32Array(SIZE); // Weighted green sum
        const bSum = new Float32Array(SIZE); // Weighted blue sum

        // Analyze each pixel
        for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3] / 255;
            if (a < 0.05) continue; // Skip transparent pixels

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const [h, s, l] = rgbToHsl(r, g, b);

            // Skip very dark or very desaturated pixels to avoid muddy colors
            // We want the colorful parts to define the theme, even if small
            if (l < 0.15 || s < 0.15) continue;

            // Weight heavily by saturation to pick up the "pop" colors
            // Cube saturation to strongly favor the most vibrant pixels
            const w = (s * s * s) * (1 - Math.abs(l - 0.5) * 0.5);

            // Calculate bin indices
            const hi = Math.max(0, Math.min(H_BINS - 1, Math.floor((h / 360) * H_BINS)));
            const si = Math.max(0, Math.min(S_BINS - 1, Math.floor(s * S_BINS)));
            const bidx = hi * S_BINS + si;

            // Accumulate weighted values
            wSum[bidx] += w;
            rSum[bidx] += r * w;
            gSum[bidx] += g * w;
            bSum[bidx] += b * w;
        }

        // Find primary color (bin with highest weight)
        let pIdx = -1;
        let pW = 0;
        for (let i = 0; i < SIZE; i++) {
            if (wSum[i] > pW) {
                pW = wSum[i];
                pIdx = i;
            }
        }

        if (pIdx < 0 || pW <= 0) return fallbackFromIndex(idx);

        const pHue = Math.floor(pIdx / S_BINS) * (360 / H_BINS);

        // Find secondary color (sufficiently different hue)
        let sIdx = -1;
        let sW = 0;
        for (let i = 0; i < SIZE; i++) {
            const w = wSum[i];
            if (w <= 0) continue;

            const h = Math.floor(i / S_BINS) * (360 / H_BINS);
            let dh = Math.abs(h - pHue);
            dh = Math.min(dh, 360 - dh); // Shortest distance on color wheel

            if (dh >= 25 && w > sW) { // At least 25° different
                sW = w;
                sIdx = i;
            }
        }

        // Calculate weighted average RGB for a bin
        const avgRGB = (idx: number): [number, number, number] => {
            const w = wSum[idx] || 1e-6;
            return [
                Math.round(rSum[idx] / w),
                Math.round(gSum[idx] / w),
                Math.round(bSum[idx] / w)
            ];
        };

        // Build primary color
        const [pr, pg, pb] = avgRGB(pIdx);
        let [h1, s1] = rgbToHsl(pr, pg, pb);
        s1 = Math.max(0.45, Math.min(1, s1 * 1.15)); // Boost saturation
        const c1 = hslToRgb(h1, s1, 0.5);

        // Build secondary color
        let c2: number[];
        if (sIdx >= 0 && sW >= pW * 0.6) {
            // Use distinct secondary color
            const [sr, sg, sb] = avgRGB(sIdx);
            let [h2, s2] = rgbToHsl(sr, sg, sb);
            s2 = Math.max(0.45, Math.min(1, s2 * 1.05));
            c2 = hslToRgb(h2, s2, 0.72);
        } else {
            // Use lighter version of primary
            c2 = hslToRgb(h1, s1, 0.72);
        }

        return { c1, c2 };
    } catch {
        return fallbackFromIndex(idx);
    }
}
