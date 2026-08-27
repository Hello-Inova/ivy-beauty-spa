"use client";

import { useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

/**
 * Auto-scrolling, seamless-loop carousel. The item list is rendered twice
 * back-to-back and the track animates exactly -50% of its own width (see
 * the `.marquee-track` keyframes in globals.css) — that loops cleanly no
 * matter how many items there are or how wide each one renders, no JS
 * measuring/rAF loop needed. Pauses on hover/focus and respects
 * prefers-reduced-motion.
 *
 * Also supports manual advance by mouse-drag or finger-swipe: on
 * pointerdown the CSS animation is frozen at its current visual position,
 * the drag delta moves the track directly, and on release the animation
 * resumes seamlessly from wherever the drag left off (via a negative
 * `animation-delay` computed from the drag's ending position).
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
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    pointerId: null as number | null,
    startX: 0,
    baseX: 0,
    moved: false,
  });
  const [isDragging, setIsDragging] = useState(false);

  function currentTranslateX(track: HTMLDivElement): number {
    const transform = window.getComputedStyle(track).transform;
    if (!transform || transform === "none") return 0;
    const match = transform.match(/matrix\(([^)]+)\)/);
    if (!match) return 0;
    const parts = match[1].split(",").map((v) => parseFloat(v.trim()));
    return parts[4] ?? 0;
  }

  function loopWidth(track: HTMLDivElement): number {
    return track.scrollWidth / 2;
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    // Prevent the browser's default mousedown behavior (focusing an inner
    // link/button, starting a text/image selection) — that default focus
    // would otherwise trip the `:focus-within` hover-pause rule and leave
    // the carousel frozen after a drag. The click itself still fires
    // normally on release for a genuine (non-drag) tap.
    e.preventDefault();
    const active = document.activeElement;
    if (active instanceof HTMLElement && track.contains(active)) active.blur();
    const x = currentTranslateX(track);
    track.style.animation = "none";
    track.style.transform = `translateX(${x}px)`;
    drag.current = { active: true, pointerId: e.pointerId, startX: e.clientX, baseX: x, moved: false };
    setIsDragging(true);
    track.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    const track = trackRef.current;
    if (!state.active || !track || state.pointerId !== e.pointerId) return;
    const delta = e.clientX - state.startX;
    if (Math.abs(delta) > 4) state.moved = true;
    const width = loopWidth(track);
    let newX = state.baseX + delta;
    if (width > 0) {
      const traveled = -newX;
      const wrapped = ((traveled % width) + width) % width;
      newX = -wrapped;
    }
    track.style.transform = `translateX(${newX}px)`;
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    const track = trackRef.current;
    if (!state.active || state.pointerId !== e.pointerId) return;
    state.active = false;
    setIsDragging(false);
    try {
      track?.releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture may already be released by the browser
    }
    if (!track) return;
    const width = loopWidth(track);
    const x = currentTranslateX(track);
    const fraction = width > 0 ? Math.min(Math.max(-x / width, 0), 1) : 0;
    track.style.transform = "";
    track.style.animation = "";
    track.style.animationDelay = `-${(fraction * durationSeconds).toFixed(3)}s`;
  }

  function handleClickCapture(e: MouseEvent<HTMLDivElement>) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="relative overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
    >
      <div
        ref={trackRef}
        className={`marquee-track flex w-max touch-pan-y select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"} ${gapClassName}`}
        style={{
          ["--marquee-duration" as string]: `${durationSeconds}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          if (drag.current.active) endDrag(e);
        }}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {doubled.map((item, i) => (
          <div
            key={keyExtractor(item, i)}
            className={`shrink-0 ${itemWidthClassName}`}
            aria-hidden={i >= items.length}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
