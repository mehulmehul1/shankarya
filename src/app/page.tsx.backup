'use client'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useStore } from '@/store/useStore'
import { useScroll, useTransform, motion, useMotionValueEvent } from 'framer-motion'
import RopeCanvas from '@/components/dom/RopeCanvas'
import Cursor from '@/components/dom/Cursor'

// Dynamic Imports
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })
const TrailingImageScene = dynamic(() => import('@/components/canvas/TrailingImageScene'), { ssr: false })
const LatchWrapper = dynamic(() => import('@/components/dom/LatchWrapper'), { ssr: false })
const VideoModal = dynamic(() => import('@/components/dom/VideoModal'), { ssr: false })

export default function Home() {
    const loading = useStore((state) => state.loading)
    const containerRef = useRef<HTMLDivElement>(null)
    const archiveRef = useRef<HTMLDivElement>(null)
    const trailingRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)

    const [vh, setVh] = useState(0)
    const [showCarousel, setShowCarousel] = useState(false)
    const [showFooter, setShowFooter] = useState(false)

    // Viewport height calculation
    useEffect(() => {
        const update = () => setVh(window.innerHeight)
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    const { scrollY } = useScroll()

    // --- TRANSITION LOGIC ---
    // Ink Curtain Animation
    const maskScale = useTransform(scrollY, [vh * 0.2, vh * 1.2], [0, 80])
    const maskOpacity = useTransform(scrollY, [0, vh * 0.2, vh * 2.5, vh * 3.5], [0, 1, 1, 0])

    // Hide Hero Elements logic
    const [hideHero, setHideHero] = useState(false)
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > vh * 0.8 && !hideHero) setHideHero(true)
        if (latest <= vh * 0.8 && hideHero) setHideHero(false)
    })

    // --- CAROUSEL SCROLL STATE ---
    const [carouselScrollProgress, setCarouselScrollProgress] = useState(0)

    // --- CAROUSEL TRIGGER LOGIC ---
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (!archiveRef.current) return

        const archiveStart = vh * 2.0
        const archiveHeight = vh * 8.0
        const triggerPoint = archiveStart + archiveHeight - vh

        if (latest > triggerPoint && latest < triggerPoint + (vh * 3) && !showCarousel) {
            setShowCarousel(true)
        } else if ((latest <= triggerPoint || latest > triggerPoint + (vh * 3)) && showCarousel) {
            setShowCarousel(false)
            setCarouselScrollProgress(0)
        }

        if (latest > triggerPoint && latest < triggerPoint + (vh * 2)) {
            const carouselProgress = (latest - triggerPoint) / (vh * 2)
            setCarouselScrollProgress(carouselProgress)
        }
    })

    // --- TRAILING IMAGE LOGIC ---
    const [trailingProgress, setTrailingProgress] = useState(0)

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (!trailingRef.current) return

        const element = trailingRef.current
        const start = element.offsetTop
        const height = element.offsetHeight

        // Pin images while scrolling
        const rangeStart = start
        const rangeEnd = start + height - vh

        let progress = (latest - rangeStart) / (rangeEnd - rangeStart)
        progress = Math.max(0, Math.min(1, progress))

        setTrailingProgress(progress)
    })

    // --- FOOTER TRIGGER LOGIC ---
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (!footerRef.current) return

        // Trigger when we enter the footer section (after trailing)
        const footerStart = footerRef.current.offsetTop - (vh * 0.5)

        if (latest > footerStart && !showFooter) {
            setShowFooter(true)
        } else if (latest <= footerStart && showFooter) {
            setShowFooter(false)
        }
    })


    // --- GATEKEEPER STATE ---
    const [modalOpen, setModalOpen] = useState(false)
    const [siteUnlocked, setSiteUnlocked] = useState(false)
    const [latchKey, setLatchKey] = useState(0)

    useEffect(() => {
        document.body.style.overflow = siteUnlocked ? 'auto' : 'hidden'
    }, [siteUnlocked])

    return (
        <div
            ref={containerRef}
            // Increased height to accommodate all sections (Hero 2 + Archive 7 + Carousel 2 + Trailing 2.5 + Footer 1 = ~14.5)
            className="relative w-full min-h-[1500vh] cursor-none bg-void"
        >
            <Cursor />

            <VideoModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setSiteUnlocked(true)
                    setLatchKey(prev => prev + 1)
                    if (!siteUnlocked) {
                        setTimeout(() => {
                            window.scrollTo({ top: window.innerHeight * 2.5, behavior: 'smooth' })
                        }, 100)
                    }
                }}
            />

            {/* --- INK CURTAIN TRANSITION --- */}
            <motion.div
                className="fixed inset-0 z-[5] pointer-events-none flex items-center justify-center overflow-hidden"
                style={{ opacity: maskOpacity }}
            >
                <motion.div
                    className="w-[200px] h-[200px] bg-void"
                    style={{
                        maskImage: 'url(/assets/ink-mask.png)',
                        WebkitMaskImage: 'url(/assets/ink-mask.png)',
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        scale: maskScale,
                    }}
                />
            </motion.div>

            {/* --- BACKGROUND SCENE (Archives / Hero / Footer) --- */}
            {!showCarousel && (
                <div className="fixed inset-0 z-0">
                    {!loading && (
                        <Scene showCarousel={false} showFooter={showFooter} />
                    )}
                </div>
            )}

            {/* --- ROPE OVERLAY --- */}
            <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${hideHero ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {!loading && (
                    <RopeCanvas
                        svgPath="/assets/tree2.svg"
                        ropeColor="#f0f0f0"
                        ropeThickness={3}
                        gravity={0.65}
                        damping={0.996}
                        iterations={7}
                        substeps={1}
                        colliderStroke={5}
                        samplesPer100px={14}
                        maxDisks={1200}
                        showCollider={false}
                        autoFit={true}
                        fitFillPercent={0.7}
                    />
                )}
            </div>

            {/* --- SCROLLABLE DOM CONTENT --- */}
            <div className="relative z-10 w-full pointer-events-none">

                {/* 1. HERO SPACER */}
                <section className="h-screen w-full"></section>

                {/* 2. TITLE + LATCH */}
                <section className="h-screen flex flex-col items-center justify-center relative px-4">
                    <div className={`transition-opacity duration-500 flex flex-col items-center w-full ${hideHero ? 'opacity-100' : 'opacity-0'}`}>

                        <div className="mix-blend-difference text-center flex flex-col items-center mb-10 md:mb-20 w-full">
                            <h1 className="font-serif text-[13vw] md:text-[25vh] text-paper leading-[0.9] tracking-tighter">
                                SHANKARYA
                            </h1>
                            <p className="font-mono text-signal text-sm md:text-3xl mt-2 md:mt-[-2rem] tracking-[0.4em] md:tracking-[0.8em] uppercase ml-0 md:ml-4 text-center">
                                Kutra Premi
                            </p>
                        </div>

                        <div className="pointer-events-auto mt-8">
                            <LatchWrapper key={latchKey} onOpen={() => setModalOpen(true)} />
                        </div>

                    </div>
                </section>

                {/* 3. ARCHIVE SCROLL ZONE */}
                <section
                    ref={archiveRef}
                    className="h-[700vh] w-full flex items-start justify-center pt-20"
                >
                    {siteUnlocked && (
                        <div className="text-center sticky top-10 mix-blend-difference z-20">
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="font-mono text-paper/50 text-[10px] tracking-[0.5em] uppercase"
                            >
                                — Mnemonic Sequence —
                            </motion.p>
                        </div>
                    )}
                </section>

                {/* 5. CAROUSEL SECTION */}
                <section className="h-[200vh] w-full">
                    {showCarousel && (
                        <div className="sticky top-0 h-screen z-[15] pointer-events-auto">
                            <Scene showCarousel={true} showFooter={false} scrollProgress={carouselScrollProgress} />
                        </div>
                    )}
                </section>

                {/* 6. TRAILING IMAGE SECTION */}
                <section ref={trailingRef} className="h-[250vh] w-full relative">
                    <div className={`${trailingProgress < 0.95 ? 'sticky top-0' : ''} h-screen z-[15] pointer-events-auto transition-all duration-500`}>
                        {!loading && <TrailingImageScene scrollProgress={trailingProgress} />}
                    </div>
                </section>

                {/* 7. FOOTER SECTION */}
                <section ref={footerRef} className="h-screen w-full relative z-[20]">
                    {!loading && (
                        <Scene showCarousel={false} showFooter={true} isFooter={true} />
                    )}
                </section>

            </div>
        </div>
    )
}