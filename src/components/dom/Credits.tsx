'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface CreditImage {
    src: string
    alt: string
}

const credits: CreditImage[] = [
    { src: '/assets/credits/credit-01.png', alt: 'Credit 1' },
    { src: '/assets/credits/credit-02.png', alt: 'Credit 2' },
]

export default function Credits() {
    return (
        <div className="relative w-full flex flex-col items-center py-[50vh] gap-[30vh] pointer-events-none">
            {credits.map((credit, i) => (
                <motion.div
                    key={credit.src}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-20%" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative w-full max-w-[60vw] md:max-w-[50vw]"
                    style={{ mixBlendMode: 'soft-light' }}
                >
                    <Image
                        src={credit.src}
                        alt={credit.alt}
                        width={1200}
                        height={400}
                        className="w-full h-auto drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                    />
                </motion.div>
            ))}
        </div>
    )
}