'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface CreditImage {
    src: string
    alt: string
}

const credits: CreditImage[] = [
    { src: '/assets/credits/credit-01.png', alt: 'Credit 1' },
    // Add more credits as needed
]

export default function Credits() {
    return (
        <div className="relative w-full">
            {credits.map((credit, i) => (
                <div
                    key={credit.src}
                    className="h-screen w-full flex items-center justify-center snap-start snap-always"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, margin: "-20%" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative w-full max-w-[70vw] md:max-w-[60vw] lg:max-w-[50vw] px-8"
                        style={{ mixBlendMode: 'normal' }}
                    >
                        <Image
                            src={credit.src}
                            alt={credit.alt}
                            width={1200}
                            height={400}
                            className="w-full h-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                            priority={i === 0}
                        />
                    </motion.div>
                </div>
            ))}
        </div>
    )
}