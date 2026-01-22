#!/usr/bin/env node

/**
 * Add CORS configuration to S3 bucket
 * This allows your website to load assets from S3
 */

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'
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

console.log('🔓 Adding CORS to S3 bucket:', AWS_S3_BUCKET)

const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
})

// CORS configuration
const corsConfiguration = {
    CORSRules: [
        {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: [],
            MaxAgeSeconds: 3600
        }
    ]
}

async function addCORS() {
    try {
        const command = new PutBucketCorsCommand({
            Bucket: AWS_S3_BUCKET,
            CORSConfiguration: corsConfiguration
        })

        await s3.send(command)
        console.log('✅ CORS configuration added successfully!')
        console.log('📋 CORS Rules:')
        console.log('   AllowedOrigins: *')
        console.log('   AllowedMethods: GET, HEAD')
        console.log('   AllowedHeaders: *')
        console.log('   MaxAgeSeconds: 3600')
        console.log('')
        console.log('🌐 Your assets can now be loaded from S3!')
        console.log('💡 Wait 30 seconds for CORS to propagate, then refresh your website')
    } catch (error) {
        console.error('❌ Error adding CORS:', error.message)
        if (error.message.includes('CORS')) {
            console.error('📋 Ensure "Block Public Access" is disabled in AWS Console')
        }
    }
}

addCORS()
