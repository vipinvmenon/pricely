import { useCallback, useLayoutEffect, useRef } from "react";

const LAYOUT_MS = 150;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function snapshotRects(keys: readonly string[], refs: Map<string, HTMLElement>): Map<string, DOMRect> {
  const next = new Map<string, DOMRect>();
  for (const k of keys) {
    const el = refs.get(k);
    if (el) next.set(k, el.getBoundingClientRect());
  }
  return next;
}

/**
 * FLIP animation when `orderedKeys` order changes (e.g. sort). Skips when reduced motion is requested.
 */
export function useOrderedListLayoutFlip(orderedKeys: readonly string[]) {
  const refs = useRef(new Map<string, HTMLElement>());
  const prevSignature = useRef<string>("");
  const prevRects = useRef(new Map<string, DOMRect>());

  const setItemRef = useCallback((key: string, el: HTMLElement | null) => {
    if (el) refs.current.set(key, el);
    else refs.current.delete(key);
  }, []);

  useLayoutEffect(() => {
    const signature = orderedKeys.join("\0");

    const saveOnly = () => {
      prevRects.current = snapshotRects(orderedKeys, refs.current);
      prevSignature.current = signature;
    };

    if (orderedKeys.length === 0) {
      prevSignature.current = "";
      prevRects.current = new Map();
      return;
    }

    if (prefersReducedMotion() || prevSignature.current === "") {
      saveOnly();
      return;
    }

    if (prevSignature.current === signature) {
      saveOnly();
      return;
    }

    const oldRects = prevRects.current;
    const newRects = snapshotRects(orderedKeys, refs.current);

    for (const k of orderedKeys) {
      const el = refs.current.get(k);
      const o = oldRects.get(k);
      const n = newRects.get(k);
      if (!el || !o || !n) continue;
      const dx = o.left - n.left;
      const dy = o.top - n.top;
      if (dx === 0 && dy === 0) continue;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = "transform 0s";
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        for (const k of orderedKeys) {
          const el = refs.current.get(k);
          if (!el) continue;
          el.style.transition = `transform ${LAYOUT_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
          el.style.transform = "";
        }
      });
    });

    window.setTimeout(() => {
      for (const k of orderedKeys) {
        const el = refs.current.get(k);
        if (el) el.style.transition = "";
      }
    }, LAYOUT_MS + 40);

    prevSignature.current = signature;
    prevRects.current = newRects;
  }, [orderedKeys]);

  return setItemRef;
}
