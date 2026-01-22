'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getAssetUrl } from '@/lib/getAssetUrl'

const MEDIA_ASSETS = [
    { src: getAssetUrl('/assets/ropegifs/0004.gif'), title: 'SEQUENCE_01', type: 'gif', span: 'row-span-2' },
    { src: getAssetUrl('/assets/ropegifs/gif_5.gif'), title: 'SEQUENCE_02', type: 'gif', span: 'col-span-2' },
    { src: getAssetUrl('/assets/ropegifs/looped.gif'), title: 'SEQUENCE_03', type: 'gif', span: '' },
    { src: getAssetUrl('/assets/ropegifs/looped_4.gif'), title: 'SEQUENCE_04', type: 'gif', span: 'row-span-2' },
    { src: getAssetUrl('/assets/ropegifs/looped_7.gif'), title: 'SEQUENCE_05', type: 'gif', span: '' },
    { src: getAssetUrl('/assets/ropegifs/output_6.gif'), title: 'SEQUENCE_06', type: 'gif', span: 'col-span-2' },
    { src: getAssetUrl('/assets/ropegifs/output_7.gif'), title: 'SEQUENCE_07', type: 'gif', span: '' },
    // Repeat or add more to fill space if needed
    { src: getAssetUrl('/assets/ropegifs/looped_4.gif'), title: 'SEQUENCE_08', type: 'gif', span: '' },
    { src: getAssetUrl('/assets/ropegifs/0004.gif'), title: 'SEQUENCE_09', type: 'gif', span: 'col-span-1' },
]

export default function GenerativeMediaGrid() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <section className="w-full min-h-screen py-20 px-4 md:px-10 bg-void">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-12"
                >
                    <h2 className="font-mono text-signal/40 text-[10px] tracking-[0.5em] uppercase mb-4">
                        — Fragmented Archives —
                    </h2>
                    <h3 className="font-serif text-4xl md:text-6xl text-paper tracking-tighter">
                        Mnemonic <br /> Lattice
                    </h3>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
                    {MEDIA_ASSETS.map((asset, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.8,
                                delay: i * 0.05,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            className={`relative group overflow-hidden bg-[#0a0a0a] border border-white/5 rounded-sm ${asset.span}`}
                        >
                            {/* Overlay info */}
                            <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-void/60 backdrop-blur-sm">
                                <span className="font-mono text-[10px] text-signal tracking-[0.3em]">
                                    {asset.title}
                                </span>
                                <div className="flex justify-between items-end">
                                    <div className="w-4 h-4 border-l border-b border-signal/50" />
                                    <span className="font-mono text-[9px] text-paper/40">
                                        SEC_0{i}
                                    </span>
                                </div>
                            </div>

                            {/* Border highlights */}
                            <div className="absolute inset-0 border border-signal/0 group-hover:border-signal/20 transition-colors duration-500 pointer-events-none z-20" />

                            <img
                                src={asset.src}
                                alt={asset.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                            />

                            {/* Grain overlay (SVG data URI to avoid external fetch policy) */}
                            <div
                                className="absolute inset-0 pointer-events-none z-30 mix-blend-soft-light opacity-50"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                }}
                            />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 flex justify-center"
                >
                    <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-signal/20 to-transparent" />
                </motion.div>
            </div>
        </section>
    )
}
