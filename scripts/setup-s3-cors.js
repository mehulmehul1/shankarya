#!/usr/bin/env node

/**
 * Setup CORS for S3 bucket
 * Allows loading assets from any origin (Netlify, local, etc.)
 */

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

const projectRoot = process.cwd()
const envPath = join(projectRoot, '.env.local')
const envConfig = dotenv.parse(readFileSync(envPath))

const s3 = new S3Client({
    region: envConfig.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY
    }
})

const bucket = envConfig.AWS_S3_BUCKET || 'shankarya-assets-2025'

// CORS configuration - allows GET requests from any origin
const corsConfiguration = {
    CORSRules: [
        {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
            MaxAgeSeconds: 3600
        }
    ]
}

console.log(`🔧 Setting up CORS for bucket: ${bucket}`)

const command = new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: corsConfiguration
})

try {
    await s3.send(command)
    console.log('✅ CORS configuration updated successfully!')
    console.log('📋 Configuration:')
    console.log('   - Allowed origins: * (any origin)')
    console.log('   - Allowed methods: GET, HEAD')
    console.log('   - Allowed headers: *')
    console.log('   - Max age: 3600 seconds')
    console.log('\n⏱️  Changes may take a few minutes to propagate')
} catch (error) {
    console.error('❌ Failed to set CORS:', error.message)
    process.exit(1)
}
