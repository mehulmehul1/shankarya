#!/usr/bin/env node

/**
 * Script to update all /assets/ references to use getAssetUrl()
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { glob } from 'glob'

const SRC_DIR = 'src'

// Files to update
const filesToUpdate = [
    'components/canvas/Gallery/GifCarousel.tsx',
    'components/canvas/Archives/ArchiveTunnel.tsx',
    'components/dom/Footer.tsx',
    'components/dom/GenerativeMediaGrid.tsx',
]

function updateAssetImports(content, filePath) {
    // Pattern 1: Direct string '/assets/...'
    const pattern1 = /'\/assets\/([^']+)'/g

    // Replace with getAssetUrl call
    let newContent = content.replace(pattern1, "getAssetUrl('$1')")

    // Count changes
    const changes = (content.match(pattern1) || []).length

    if (changes > 0) {
        console.log(`✅ ${filePath}: Updated ${changes} asset references`)
        return newContent
    }

    return null
}

// Process each file
for (const relativePath of filesToUpdate) {
    const fullPath = join(SRC_DIR, relativePath)

    try {
        const content = readFileSync(fullPath, 'utf-8')
        const updated = updateAssetImports(content, relativePath)

        if (updated) {
            writeFileSync(fullPath, updated)
        }
    } catch (error) {
        console.log(`⚠️  ${relativePath}: ${error.message}`)
    }
}

console.log('\n📝 Next steps:')
console.log('1. Review changes in git')
console.log('2. Run: bun run dev to test')
console.log('3. Check Network tab in browser for S3 URLs')
