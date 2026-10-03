"use client";

import { useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface CarouselScreen {
  src: string;
  alt: string;
  caption: string;
}

export function WebScreensCarousel({ screens }: { screens: CarouselScreen[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function goTo(next: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(screens.length - 1, next));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  return (
    <div className="mx-auto mt-6 max-w-4xl" role="group" aria-roledescription="carousel" aria-label="Web app screenshots">
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {screens.map((screen, i) => (
            <figure
              key={screen.src}
              className="w-full shrink-0 snap-center"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${screens.length}`}
            >
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted px-3 py-2" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- small static WebP, lazy-loaded; next/image adds nothing here */}
                <img
                  src={screen.src}
                  alt={screen.alt}
                  width={1100}
                  height={580}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 text-center text-sm font-medium">{screen.caption}</figcaption>
            </figure>
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous screenshot"
          className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 shadow-md backdrop-blur transition hover:bg-background disabled:pointer-events-none disabled:opacity-0 sm:-left-4"
        >
          <CaretLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === screens.length - 1}
          aria-label="Next screenshot"
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 shadow-md backdrop-blur transition hover:bg-background disabled:pointer-events-none disabled:opacity-0 sm:-right-4"
        >
          <CaretRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {screens.map((screen, i) => (
          <button
            key={screen.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show screenshot ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-2 bg-foreground/20 hover:bg-foreground/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
