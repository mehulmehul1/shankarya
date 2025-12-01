'use client'
import OldManTrailingDOM from '../dom/OldManTrailingDOM'

interface TrailingImageSceneProps {
    scrollProgress: number
}

export default function TrailingImageScene({ scrollProgress }: TrailingImageSceneProps) {
    // Simple DOM component - no 3D needed
    return (
        <div className="absolute inset-0 pointer-events-none">
            {scrollProgress > 0 && <OldManTrailingDOM scrollProgress={scrollProgress} />}
        </div>
    )
}