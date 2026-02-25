'use client'
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useStore } from '@/store/useStore'
import { useScroll, useTransform, motion, useMotionValueEvent } from 'framer-motion'
import RopeCanvas from '@/components/dom/RopeCanvas'
import Cursor from '@/components/dom/Cursor'
import { getAssetUrl } from '@/lib/getAssetUrl'
import { useDocumentMeta } from '@/lib/useDocumentMeta'

const Scene = lazy(() => import('@/components/canvas/Scene'))
const TrailingImageScene = lazy(() => import('@/components/canvas/TrailingImageScene'))
const LatchWrapper = lazy(() => import('@/components/dom/LatchWrapper'))
const VideoModal = lazy(() => import('@/components/dom/VideoModal'))
const Footer = lazy(() => import('@/components/dom/Footer'))
const GenerativeMediaGrid = lazy(() => import('@/components/dom/GenerativeMediaGrid'))
const MiniAppUI = lazy(() => import('@/components/dom/MiniAppUI'))

export default function Home() {
    useDocumentMeta({
        title: 'SHANKARYA: Kutra Premi',
        description: 'A Cinematic WebGPU Experience for Base and Farcaster.'
    })

    const loading = useStore((state) => state.loading)
    const containerRef = useRef<HTMLDivElement>(null)
    const archiveRef = useRef<HTMLDivElement>(null)
    const trailingRef = useRef<HTMLDivElement>(null)
    const carouselSectionRef = useRef<HTMLDivElement>(null)

    const [vh, setVh] = useState(0)

    useEffect(() => {
        const update = () => setVh(window.innerHeight)
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    const { scrollY } = useScroll()

    const maskScale = useTransform(scrollY, [vh * 0.2, vh * 1.2], [0, 80])
    const maskOpacity = useTransform(scrollY, [0, vh * 0.2, vh * 2.5, vh * 3.5], [0, 1, 1, 0])

    const [hideHero, setHideHero] = useState(false)
    useMotionValueEvent(scrollY, 'change', (latest) => {
        if (latest > vh * 0.8 && !hideHero) setHideHero(true)
        if (latest <= vh * 0.8 && hideHero) setHideHero(false)
    })

    const [trailingProgress, setTrailingProgress] = useState(0)

    useMotionValueEvent(scrollY, 'change', (latest) => {
        if (!trailingRef.current) return

        const element = trailingRef.current
        const start = element.offsetTop
        const height = element.offsetHeight

        const rangeStart = start
        const rangeEnd = start + height - vh

        let progress = (latest - rangeStart) / (rangeEnd - rangeStart)
        progress = Math.max(0, Math.min(1, progress))

        setTrailingProgress(progress)
    })

    const [modalOpen, setModalOpen] = useState(false)
    const [siteUnlocked, setSiteUnlocked] = useState(false)
    const [latchKey, setLatchKey] = useState(0)

    useEffect(() => {
        document.body.style.overflow = siteUnlocked ? 'auto' : 'hidden'
    }, [siteUnlocked])

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-[1650vh] cursor-none bg-void"
        >
            <Cursor />

            <Suspense fallback={null}>
                <MiniAppUI />
            </Suspense>

            <Suspense fallback={null}>
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
            </Suspense>

            <motion.div
                className="fixed inset-0 z-[5] pointer-events-none flex items-center justify-center overflow-hidden"
                style={{ opacity: maskOpacity }}
            >
                <motion.div
                    className="w-[200px] h-[200px] bg-void"
                    style={{
                        maskImage: `url(${getAssetUrl('/assets/ink-mask.png')})`,
                        WebkitMaskImage: `url(${getAssetUrl('/assets/ink-mask.png')})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        scale: maskScale,
                    }}
                />
            </motion.div>

            <div className="fixed inset-0 z-0">
                {!loading && (
                    <Suspense fallback={null}>
                        <Scene />
                    </Suspense>
                )}
            </div>

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

            <div className="relative z-10 w-full pointer-events-none">
                <section className="h-screen w-full"></section>

                <section className="h-screen flex flex-col items-center justify-center relative px-4">
                    <div className={`transition-opacity duration-500 flex flex-col items-center w-full ${hideHero ? 'opacity-100' : 'opacity-0'}`}>
                        <StaticHeroTitle />

                        <div className="pointer-events-auto mt-8">
                            <Suspense fallback={null}>
                                <LatchWrapper key={latchKey} onOpen={() => setModalOpen(true)} />
                            </Suspense>
                        </div>
                    </div>
                </section>

                <section
                    ref={archiveRef}
                    className="h-[700vh] w-full flex items-start justify-center pt-20"
                >
                    {siteUnlocked && (
                        <div className="text-center sticky top-10 mix-blend-difference z-20">
                            <MnemonicSequenceLabel />
                        </div>
                    )}
                </section>

                <section
                    ref={carouselSectionRef}
                    className="relative z-[15] pointer-events-auto"
                >
                    <Suspense fallback={null}>
                        <GenerativeMediaGrid />
                    </Suspense>
                </section>

                <section ref={trailingRef} className="h-[250vh] w-full relative">
                    <div className={`${trailingProgress < 0.95 ? 'sticky top-0' : ''} h-screen z-[15] pointer-events-auto transition-all duration-500 ${trailingProgress >= 0.95 ? 'opacity-0' : ''}`}>
                        {!loading && (
                            <Suspense fallback={null}>
                                <TrailingImageScene scrollProgress={trailingProgress} />
                            </Suspense>
                        )}
                    </div>
                </section>

                <div className="pointer-events-auto relative z-[20]">
                    <Suspense fallback={null}>
                        <Footer />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

const StaticHeroTitle = () => (
    <div className="mix-blend-difference text-center flex flex-col items-center mb-10 md:mb-20 w-full">
        <h1 className="font-serif text-[13vw] md:text-[25vh] text-paper leading-[0.9] tracking-tighter">
            SHANKARYA
        </h1>
        <p className="font-mono text-signal text-sm md:text-3xl mt-2 md:mt-[-2rem] tracking-[0.4em] md:tracking-[0.8em] uppercase ml-0 md:ml-4 text-center">
            Kutra Premi
        </p>
    </div>
)

const MnemonicSequenceLabel = () => (
    <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="font-mono text-paper/50 text-[10px] tracking-[0.5em] uppercase"
    >
        --- Mnemonic Sequence ---
    </motion.p>
)
