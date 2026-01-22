'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAssetUrl } from '@/lib/getAssetUrl'

interface VideoModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (isOpen && videoRef.current) {
            videoRef.current.currentTime = 0
            videoRef.current.play()
        } else if (!isOpen && videoRef.current) {
            videoRef.current.pause()
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // Added onClick handler to the background
                    onClick={onClose}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-pointer"
                >
                    {/* Close Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose() }}
                        className="absolute top-6 right-6 text-concrete font-mono text-xs tracking-widest hover:text-signal transition-colors z-[110]"
                    >
                        [CLOSE TERMINAL]
                    </button>

                    {/* Video Container */}
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        // Stop click propagation so clicking video doesn't close it
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-6xl aspect-video border border-white/10 shadow-2xl bg-black cursor-auto"
                    >
                        <video
                            ref={videoRef}
                            src={getAssetUrl("/assets/film.mp4")}
                            className="w-full h-full object-contain"
                            controls={true}
                            controlsList="nodownload noremoteplayback"
                            loop={false}
                            playsInline
                        />
                    </motion.div>

                    {/* Footer Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 flex items-center gap-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <a
                            href="https://zora.co"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all hover:scale-105 active:scale-95"
                        >
                            <img
                                src={getAssetUrl("/assets/zoralogo.png")}
                                alt="Zora"
                                className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100"
                            />
                            <span className="font-mono text-sm text-paper tracking-wider">
                                COLLECT ON ZORA
                            </span>
                        </a>
                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>
    )
}