#!/usr/bin/env node

/**
 * List S3 bucket contents to verify assets
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'
import { join } from 'path'

// Load .env.local
const projectRoot = process.cwd()
const envPath = join(projectRoot, '.env.local')
const envConfig = dotenv.parse(readFileSync(envPath))

const AWS_ACCESS_KEY_ID = envConfig.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = envConfig.AWS_SECRET_ACCESS_KEY
const AWS_REGION = envConfig.AWS_REGION
const AWS_S3_BUCKET = envConfig.AWS_S3_BUCKET

console.log('🪣 Checking S3 bucket:', AWS_S3_BUCKET)
console.log('📍 Region:', AWS_REGION)

const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
})

async function listBucket() {
    const command = new ListObjectsV2Command({
        Bucket: AWS_S3_BUCKET
    })

    try {
        const response = await s3.send(command)
        const objects = response.Contents || []
        
        console.log(`\n📦 Found ${objects.length} objects in bucket:\n`)
        
        objects.forEach(obj => {
            const size = (obj.Size / 1024).toFixed(2)
            console.log(`  • ${obj.Key} (${size} KB)`)
        })
        
        if (objects.length === 0) {
            console.log('  (Bucket is empty!)')
        }
        
    } catch (error) {
        console.error('❌ Error listing bucket:', error.message)
    }
}

listBucket()
