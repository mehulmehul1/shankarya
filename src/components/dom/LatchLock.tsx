'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface LatchLockProps {
    onUnlock: () => void
}

// Assets extracted from the Framer code
const ASSETS = {
    background: "https://framerusercontent.com/images/T6qF4l74oqVyHqsYnIjSTQOhKoc.png?width=1828&height=944",
    rightBolt: "https://framerusercontent.com/images/OTL9yCFWs2hL5L1aQ8LTlP6qK9s.png?width=108&height=308",
    slideLatch: "https://framerusercontent.com/images/0r4ApWyfHM0xEGxLtJiMQVpcd2k.png?width=1612&height=603",
    midBolt: "https://framerusercontent.com/images/oktDTMIdHmnFDT9ukt3lrgZ6g.png?width=232&height=256",
    endBolt: "https://framerusercontent.com/images/NoqgS9CEK08eOsk1FwKNlvAvHd0.png?width=104&height=300"
}

export default function LatchLock({ onUnlock }: LatchLockProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isUnlocked, setIsUnlocked] = useState(false)

    // Animation Variants based on the Framer code logic
    const latchVariants = {
        base: { x: 0 },
        hover: { x: 10 }, // Slight movement on hover
        unlocked: { x: 55 } // Full slide to open
    }

    const handleClick = () => {
        if (isUnlocked) return
        setIsUnlocked(true)

        // Trigger the callback after animation roughly finishes
        setTimeout(() => {
            onUnlock()
        }, 400)
    }

    return (
        <motion.div
            className="relative w-[174px] h-[88px] cursor-pointer select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            initial="base"
            animate={isUnlocked ? "unlocked" : isHovered ? "hover" : "base"}
        >
            {/* LAYER 1: Background Group */}
            <div className="absolute inset-0 z-0">
                {/* Main Base Plate */}
                <img
                    src={ASSETS.background}
                    alt="Lock Base"
                    className="absolute top-0 left-0 w-[170px] h-[88px] object-cover pointer-events-none"
                />
                {/* Small Right Bolt */}
                <img
                    src={ASSETS.rightBolt}
                    alt="Bolt"
                    className="absolute top-[8px] left-[159px] w-[10px] h-[29px] object-cover pointer-events-none"
                />
            </div>

            {/* LAYER 2: The Sliding Latch (The Moving Part) */}
            <motion.div
                className="absolute top-[16px] right-[24px] z-10 w-[150px] h-[56px]"
                variants={latchVariants}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            >
                <img
                    src={ASSETS.slideLatch}
                    alt="Slider"
                    className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
                />
            </motion.div>

            {/* LAYER 3: Front Group (Bolts that sit on top) */}
            <div className="absolute top-[8px] left-[73px] w-[96px] h-[28px] z-20 pointer-events-none">
                {/* Mid Bolt */}
                <img
                    src={ASSETS.midBolt}
                    className="absolute top-[4px] left-0 w-[22px] h-[24px]"
                />
                {/* End Bolt (Hard Light Blend Mode in original, replicated here) */}
                <img
                    src={ASSETS.endBolt}
                    className="absolute top-0 left-[86px] w-[10px] h-[28px] mix-blend-hard-light"
                />
            </div>

            {/* Optional: Add a subtle glow on hover to indicate interactivity */}
            {isHovered && !isUnlocked && (
                <motion.div
                    layoutId="glow"
                    className="absolute inset-0 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] z-[-1]"
                />
            )}
        </motion.div>
    )
}