'use client'

import { forwardRef } from 'react'
import styles from './carousel.module.css'

interface CardProps {
    src: string
    transform: string
    zIndex: number
    blur: number
    style?: React.CSSProperties
}

const CarouselCard = forwardRef<HTMLElement, CardProps>(
    ({ src, transform, zIndex, blur, style }, ref) => {
        return (
            <article
                ref={ref}
                className={styles.card}
                style={{
                    transform,
                    zIndex,
                    filter: `blur(${blur.toFixed(2)}px)`,
                    ...style
                }}
            >
                <img
                    src={src}
                    alt=""
                    className={styles.cardImage}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                />
            </article>
        )
    }
)

CarouselCard.displayName = 'CarouselCard'

export default CarouselCard
