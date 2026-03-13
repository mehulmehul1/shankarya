'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export interface MiniAppContext {
    context: string | null
    platform: 'farcaster' | 'base' | 'web' | null
    channelToken: string | null
    fid: number | null
    username: string | null
}

/**
 * Detect platform context (Base App, Farcaster, or standalone web)
 * Compatible with Base App's standard web app model
 */
export function useMiniApp() {
    const [context, setContext] = useState<MiniAppContext>({
        context: null,
        platform: null,
        channelToken: null,
        fid: null,
        username: null,
    })

    const { address, isConnected } = useAccount()

    useEffect(() => {
        // Detect platform from URL parameters
        const searchParams = new URLSearchParams(window.location.search)
        const channelToken = searchParams.get('channelToken')
        const fid = searchParams.get('fid')
        const baseParam = searchParams.get('base')

        // Platform detection
        let platform: 'farcaster' | 'base' | 'web' = 'web'

        // Base App detection
        if (baseParam || navigator.userAgent.includes('BaseApp')) {
            platform = 'base'
        }
        // Legacy Farcaster detection (for backwards compatibility)
        else if ((window as any).fcSdk !== undefined) {
            platform = 'farcaster'
        }

        setContext({
            context: channelToken,
            platform,
            channelToken,
            fid: fid ? parseInt(fid, 10) : null,
            username: null,
        })

        if (platform === 'base') {
            console.log('[MiniApp] Running in Base App context', {
                channelToken,
                isConnected,
                address,
            })
        } else if (platform === 'farcaster') {
            console.log('[MiniApp] Running in Farcaster context (legacy)', {
                channelToken,
                fid,
            })
        } else {
            console.log('[MiniApp] Running in standalone web mode')
        }
    }, [isConnected, address])

    /**
     * Share content - uses Web Share API or native sharing
     */
    const share = async (text: string, url?: string) => {
        const shareData: ShareData = {
            title: 'Shankarya: Kutra Prem',
            text,
            ...(url && { url }),
        }

        // Try native Web Share API first (works in mobile browsers including Base App)
        if (navigator.share) {
            try {
                await navigator.share(shareData)
                return true
            } catch (error) {
                // User cancelled or error occurred
                console.log('[MiniApp] Share cancelled or failed:', error)
                return false
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(url || text)
            console.log('[MiniApp] Copied to clipboard')
            return true
        } catch (error) {
            console.error('[MiniApp] Share failed:', error)
            return false
        }
    }

    /**
     * Close the mini app (works in Base App browser)
     */
    const close = () => {
        // In Base App's standard browser, window.close() may work
        // Otherwise this is a no-op in regular browsers
        try {
            window.close()
        } catch (error) {
            console.log('[MiniApp] Close not supported in this context')
        }
    }

    return {
        ...context,
        share,
        close,
        // Helper to know if we're in any mini app context
        isMiniApp: context.platform === 'farcaster' || context.platform === 'base',
        // Base App specific
        isBaseApp: context.platform === 'base',
        // Wallet connection status from wagmi
        isConnected,
        address,
    }
}
