"use client";

import type { ReactNode } from "react";

/**
 * Auto-scrolling, seamless-loop carousel. The item list is rendered twice
 * back-to-back and the track animates exactly -50% of its own width (see
 * the `.marquee-track` keyframes in globals.css) — that loops cleanly no
 * matter how many items there are or how wide each one renders, no JS
 * measuring/rAF loop needed. Pauses on hover/focus and respects
 * prefers-reduced-motion.
 */
export default function InfiniteCarousel<T>({
  items,
  renderItem,
  keyExtractor,
  ariaLabel,
  durationSeconds = 36,
  itemWidthClassName = "w-[280px] sm:w-[320px]",
  gapClassName = "gap-5",
  reverse = false,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  ariaLabel: string;
  durationSeconds?: number;
  itemWidthClassName?: string;
  gapClassName?: string;
  reverse?: boolean;
}) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="relative overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
    >
      <div
        className={`marquee-track flex w-max ${gapClassName}`}
        style={{
          ["--marquee-duration" as string]: `${durationSeconds}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {doubled.map((item, i) => (
          <div key={keyExtractor(item, i)} className={`shrink-0 ${itemWidthClassName}`} aria-hidden={i >= items.length}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
