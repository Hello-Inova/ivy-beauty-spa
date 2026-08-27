"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

/**
 * Auto-scrolling, seamless-loop carousel. The item list is rendered twice
 * back-to-back and the track animates exactly -50% of its own width (see
 * the `.marquee-track` keyframes in globals.css) — that loops cleanly no
 * matter how many items there are or how wide each one renders, no JS
 * measuring/rAF loop needed. Pauses on hover/focus and respects
 * prefers-reduced-motion.
 *
 * Also supports manual advance by mouse-drag, finger-swipe, or the
 * previous/next buttons: in every case the CSS animation is frozen at its
 * current visual position, the track is moved directly (via drag delta or
 * a one-step animated transition), and once the interaction ends the
 * marquee animation resumes seamlessly from wherever it was left off (via
 * a negative `animation-delay` computed from the ending position).
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
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  function wrap(rawX: number, width: number): number {
    if (width <= 0) return rawX;
    const traveled = -rawX;
    const wrapped = ((traveled % width) + width) % width;
    return -wrapped;
  }

  // Hands control back to the CSS marquee animation, picking up exactly
  // where the track's current transform left off.
  function resumeAnimation(track: HTMLDivElement) {
    const width = loopWidth(track);
    const x = currentTranslateX(track);
    const fraction = width > 0 ? Math.min(Math.max(-x / width, 0), 1) : 0;
    track.style.transition = "";
    track.style.transform = "";
    track.style.animation = "";
    track.style.animationDelay = `-${(fraction * durationSeconds).toFixed(3)}s`;
  }

  // Distance (px) covered by one item, including its gap to the next one —
  // measured from the live DOM so it stays correct across breakpoints.
  function stepWidth(track: HTMLDivElement): number {
    const a = track.children[0] as HTMLElement | undefined;
    const b = track.children[1] as HTMLElement | undefined;
    if (!a || !b) return 0;
    return b.getBoundingClientRect().left - a.getBoundingClientRect().left;
  }

  function goTo(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const s = stepWidth(track);
    if (!s) return;
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    const width = loopWidth(track);
    const current = currentTranslateX(track);
    const target = wrap(current - direction * s, width);
    track.style.animation = "none";
    track.style.transition = "transform 0.45s ease";
    track.style.transform = `translateX(${target}px)`;
    settleTimeout.current = setTimeout(() => {
      if (trackRef.current) resumeAnimation(trackRef.current);
      settleTimeout.current = null;
    }, 460);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    if (settleTimeout.current) {
      clearTimeout(settleTimeout.current);
      settleTimeout.current = null;
    }
    // Prevent the browser's default mousedown behavior (focusing an inner
    // link/button, starting a text/image selection) — that default focus
    // would otherwise trip the `:focus-within` hover-pause rule and leave
    // the carousel frozen after a drag. The click itself still fires
    // normally on release for a genuine (non-drag) tap.
    e.preventDefault();
    const active = document.activeElement;
    if (active instanceof HTMLElement && track.contains(active)) active.blur();
    const x = currentTranslateX(track);
    track.style.transition = "";
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
    const newX = wrap(state.baseX + delta, width);
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
    resumeAnimation(track);
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
  const navButtonClass =
    "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-ivory/90 text-charcoal shadow-[0_2px_12px_-4px_rgba(46,42,40,0.25)] backdrop-blur transition-colors hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-deep";

  return (
    <div className="relative">
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

      <button
        type="button"
        onClick={() => goTo(-1)}
        aria-label={`Item anterior — ${ariaLabel}`}
        title="Anterior"
        className={`${navButtonClass} left-1 sm:left-2`}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => goTo(1)}
        aria-label={`Próximo item — ${ariaLabel}`}
        title="Próximo"
        className={`${navButtonClass} right-1 sm:right-2`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
