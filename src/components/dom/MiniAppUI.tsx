'use client'

import { useMiniApp } from '@/lib/useMiniApp'
import { motion, AnimatePresence } from 'framer-motion'

export default function MiniAppUI() {
    const { platform, isMiniApp, share } = useMiniApp()

    const handleShare = async () => {
        await share('Check out Shankarya - Kutra Premi, a WebGPU cinematic experience!')
    }

    if (!isMiniApp) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
            >
                <div className="bg-black/50 backdrop-blur-md border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-300">
                        {platform === 'farcaster' ? 'Farcaster' : 'Base'}
                    </span>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-blue-500/50"
                >
                    Share
                </motion.button>
            </motion.div>
        </AnimatePresence>
    )
}
