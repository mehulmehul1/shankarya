#!/usr/bin/env node

/**
 * Set S3 bucket policy to allow public read access
 */

import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from '@aws-sdk/client-s3'
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

console.log('🔓 Setting S3 bucket policy for:', AWS_S3_BUCKET)

const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
})

// Bucket policy allowing public read access
const bucketPolicy = {
    Version: "2012-10-17",
    Statement: [
        {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${AWS_S3_BUCKET}/*`
        }
    ]
}

async function setBucketPolicy() {
    try {
        // First, check if "Block Public Access" is enabled
        console.log('⚠️  IMPORTANT: You must disable "Block Public Access" in AWS Console first!')
        console.log('📋 Steps:')
        console.log('   1. Go to https://s3.console.aws.amazon.com/s3/buckets')
        console.log(`   2. Click on bucket: ${AWS_S3_BUCKET}`)
        console.log('   3. Go to "Permissions" tab')
        console.log('   4. Click "Edit" under "Block public access"')
        console.log('   5. Uncheck "Block all public access"')
        console.log('   6. Confirm and save')
        console.log('')
        console.log('   Then run this script again to set bucket policy.')
        
        const command = new PutBucketPolicyCommand({
            Bucket: AWS_S3_BUCKET,
            Policy: JSON.stringify(bucketPolicy)
        })

        await s3.send(command)
        console.log('✅ Bucket policy set successfully!')
        console.log('🌐 Your assets are now publicly accessible')
    } catch (error) {
        if (error.name === 'AccessDenied' || error.message.includes('BlockPublicAccess')) {
            console.error('❌ Error: Block Public Access is enabled on this bucket')
            console.error('📋 Please disable it in AWS Console first (see steps above)')
        } else {
            console.error('❌ Error setting bucket policy:', error.message)
        }
    }
}

setBucketPolicy()
