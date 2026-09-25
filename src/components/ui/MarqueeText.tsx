'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Single-line text that truncates with an ellipsis by default and, once
 * hydrated, scrolls to reveal the full string on hover — only when it
 * actually overflows its container (short titles never animate).
 */
export default function MarqueeText({
  children,
  className = '',
}: {
  children: string
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !textRef.current) return
      const overflow =
        textRef.current.scrollWidth - containerRef.current.clientWidth
      setDistance(overflow > 0 ? overflow : 0)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [children])

  return (
    <div
      ref={containerRef}
      className={`group/marquee min-w-0 overflow-hidden ${className}`}
    >
      <span
        ref={textRef}
        style={
          distance > 0
            ? ({
                '--marquee-distance': `-${distance}px`,
                transitionDuration: `${Math.min(2000, Math.max(400, distance * 10))}ms`,
              } as React.CSSProperties)
            : undefined
        }
        className={
          distance > 0
            ? 'inline-block max-w-none translate-x-0 whitespace-nowrap transition-transform ease-out group-hover/marquee:translate-x-(--marquee-distance)'
            : 'block truncate whitespace-nowrap'
        }
      >
        {children}
      </span>
    </div>
  )
}
