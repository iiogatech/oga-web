import HeroSlider, { type HeroSlide } from '@/components/home/HeroSlider'
import Enter from '@/components/motion/Enter'
import Button from '@/components/ui/Button'
import HeroHeading from '@/components/ui/HeroHeading'
import type { HomePage } from '@/sanity/lib/content'

export default function Hero({
  slides,
}: {
  slides: HomePage['hero']['slides']
}) {
  if (slides.length === 0) return null

  const items: HeroSlide[] = slides.map((slide) => ({
    key: slide._key,
    image: slide.image,
    content: (
      <div className="flex max-w-4xl flex-col items-start gap-6">
        {slide.eyebrow && (
          <Enter
            as="span"
            className="font-plus-jakarta-sans rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.6px] text-white uppercase backdrop-blur-[5px]"
          >
            {slide.eyebrow}
          </Enter>
        )}
        {slide.headline && (
          <HeroHeading
            text={slide.headline}
            delay={0.07}
            className="font-poppins text-5xl leading-tight font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
          />
        )}
        <Enter delay={0.14} className="flex flex-wrap items-center gap-4 pt-3">
          {slide.ctaLabel && (
            <Button href={slide.ctaUrl} variant="light">
              {slide.ctaLabel}
            </Button>
          )}
          {slide.secondaryCtaLabel && (
            <Button href={slide.secondaryCtaUrl} variant="glass">
              {slide.secondaryCtaLabel}
            </Button>
          )}
        </Enter>
      </div>
    ),
  }))

  return (
    <section className="bg-brand-950 relative flex min-h-[600px] items-center overflow-hidden pt-32 pb-24 sm:min-h-180 sm:pt-42 sm:pb-38">
      <HeroSlider slides={items} />
    </section>
  )
}
