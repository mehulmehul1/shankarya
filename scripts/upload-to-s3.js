#!/usr/bin/env node

/**
 * Upload assets to AWS S3
 * Reads from .env.local for credentials
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative, extname } from 'path'
import dotenv from 'dotenv'

// Load .env.local from project root
const projectRoot = process.cwd()
const envPath = join(projectRoot, '.env.local')
const envConfig = dotenv.parse(readFileSync(envPath))

const AWS_ACCESS_KEY_ID = envConfig.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = envConfig.AWS_SECRET_ACCESS_KEY
const AWS_REGION = envConfig.AWS_REGION
const AWS_S3_BUCKET = envConfig.AWS_S3_BUCKET

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET) {
    console.error('❌ Missing required environment variables. Check .env.local')
    process.exit(1)
}

console.log('📦 Uploading to S3 bucket:', AWS_S3_BUCKET)
console.log('📍 Region:', AWS_REGION)

// Create S3 client
const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
})

// Content type mapping
const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, fileList = []) {
    const files = readdirSync(dirPath)

    for (const file of files) {
        const fullPath = join(dirPath, file)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
            getAllFiles(fullPath, fileList)
        } else {
            fileList.push(fullPath)
        }
    }

    return fileList
}

/**
 * Upload a single file to S3
 */
async function uploadFile(filePath) {
    const ext = extname(filePath).toLowerCase()
    const contentType = contentTypes[ext] || 'application/octet-stream'

    // Calculate S3 key (relative path from public/)
    const publicDir = join(projectRoot, 'public')
    const relativePath = relative(publicDir, filePath)
    const key = `assets/${relativePath.replace(/\\/g, '/')}`

    const fileContent = readFileSync(filePath)

    const command = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        // Make files publicly readable
        ACL: 'public-read'
    })

    try {
        await s3.send(command)
        console.log(`✅ Uploaded: ${key}`)
        return { success: true, key }
    } catch (error) {
        console.error(`❌ Failed to upload ${key}:`, error.message)
        return { success: false, key, error: error.message }
    }
}

/**
 * Main upload function
 */
async function uploadAssets() {
    const assetsDir = join(projectRoot, 'public/assets')

    if (!statSync(assetsDir).isDirectory()) {
        console.error('❌ public/assets directory not found at:', assetsDir)
        process.exit(1)
    }

    console.log('🔍 Scanning public/assets/...')
    const files = getAllFiles(assetsDir)
    console.log(`📁 Found ${files.length} files`)

    let successCount = 0
    let failCount = 0

    for (const filePath of files) {
        const result = await uploadFile(filePath)
        if (result.success) {
            successCount++
        } else {
            failCount++
        }
    }

    console.log('\n📊 Upload Summary:')
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📦 Total: ${successCount + failCount}`)

    if (failCount === 0) {
        console.log('\n🎉 All assets uploaded successfully!')
        console.log(`🌐 Access at: https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`)
    }
}

// Run upload
uploadAssets().catch(console.error)
