'use client'
import { motion } from 'framer-motion'
import LatchLock from './LatchLock'

interface LatchProps {
    onOpen: () => void
}

export default function LatchWrapper({ onOpen }: LatchProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="relative z-50 flex flex-col items-center gap-4"
        >
            {/* Scale it up for impact */}
            <div className="transform scale-125 md:scale-150 origin-bottom">
                <LatchLock onUnlock={onOpen} />
            </div>

            {/* Helper Text */}
            <span className="font-mono text-[10px] text-concrete animate-pulse tracking-widest uppercase">
                Click to Release
            </span>
        </motion.div>
    )
}