'use client'

import type { SanityImageSource } from '@sanity/image-url'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'

import { EASE_REVEAL } from '@/components/motion/variants'
import Container from '@/components/ui/Container'
import SanityImage from '@/components/ui/SanityImage'

const AUTOPLAY_MS = 6000

export type HeroSlide = {
  key: string
  image: (SanityImageSource & { alt?: string }) | null | undefined
  content: ReactNode
}

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()
  const single = slides.length === 1
  // True until the hero advances for the first time — only the very first
  // slide ever shown gets the page-load zoom-out treatment, not every
  // autoplay/dot swap.
  const [hasAdvanced, setHasAdvanced] = useState(false)

  useEffect(() => {
    if (single || reduceMotion || paused) return
    const id = setInterval(() => {
      setHasAdvanced(true)
      setIndex((i) => (i + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [single, reduceMotion, paused, slides.length])

  const active = slides[index]
  const isInitialSlide = index === 0 && !hasAdvanced

  function goTo(i: number) {
    setHasAdvanced(true)
    setIndex(i)
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={active.key}
          className="absolute inset-0"
          initial={reduceMotion ? false : { scale: 1.2 }}
          animate={{ scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 2.4, ease: EASE_REVEAL }}
        >
          <SanityImage
            image={active.image}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {isInitialSlide && (
        <motion.div
          aria-hidden="true"
          className="bg-brand-950 pointer-events-none absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: EASE_REVEAL }}
        />
      )}

      <div className="from-brand-950 via-brand-950/60 absolute inset-0 bg-linear-to-tr to-transparent" />
      <div className="from-brand-950/70 absolute inset-0 bg-linear-to-t to-transparent" />

      <Container className="relative flex h-full items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_REVEAL }}
          >
            {active.content}
          </motion.div>
        </AnimatePresence>
      </Container>

      {!single && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              aria-label={`Show slide ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-[width,background-color] duration-200 ${
                i === index
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
