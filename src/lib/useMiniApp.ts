'use client'

import { useEffect, useState } from 'react'

export interface MiniAppContext {
    context: string | null
    platform: 'farcaster' | 'base' | 'web' | null
    channelToken: string | null
    fid: number | null
    username: string | null
}

export function useMiniApp() {
    const [context, setContext] = useState<MiniAppContext>({
        context: null,
        platform: null,
        channelToken: null,
        fid: null,
        username: null,
    })

    useEffect(() => {
        // Detect if we're running in a Farcaster Mini-App
        const searchParams = new URLSearchParams(window.location.search)
        const channelToken = searchParams.get('channelToken')
        const fid = searchParams.get('fid')

        // Check for Farcaster SDK presence
        const isFarcaster = (window as any).fcSdk !== undefined
        const isBase = searchParams.has('base')

        setContext({
            context: channelToken,
            platform: isFarcaster ? 'farcaster' : isBase ? 'base' : 'web',
            channelToken,
            fid: fid ? parseInt(fid, 10) : null,
            username: null,
        })

        if (isFarcaster) {
            console.log('[MiniApp] Running in Farcaster context', { channelToken, fid })
        } else if (isBase) {
            console.log('[MiniApp] Running in Base context')
        } else {
            console.log('[MiniApp] Running in standalone web mode')
        }
    }, [])

    const share = async (text: string) => {
        if (context.platform === 'farcaster') {
            try {
                // Use Farcaster SDK to share
                const sdk = (window as any).fcSdk
                if (sdk?.share) {
                    await sdk.share({ text })
                    return true
                }
            } catch (error) {
                console.error('[MiniApp] Share failed:', error)
            }
        }
        return false
    }

    const close = () => {
        if (context.platform === 'farcaster') {
            try {
                const sdk = (window as any).fcSdk
                if (sdk?.close) {
                    sdk.close()
                }
            } catch (error) {
                console.error('[MiniApp] Close failed:', error)
            }
        }
    }

    return {
        ...context,
        share,
        close,
        isMiniApp: context.platform === 'farcaster' || context.platform === 'base',
    }
}
