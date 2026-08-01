"use client";

import { useEffect } from "react";

/**
 * Reveals elements tagged with [data-reveal] / [data-reveal-stagger]
 * as they scroll into view by toggling the `.is-visible` class.
 *
 * Robust against late-mounted content (e.g. nodes rendered after a
 * Suspense boundary resolves): a MutationObserver re-scans for new
 * targets, and a safety timeout guarantees content is never left
 * permanently hidden if the observer misses it.
 */
export function useScrollAnimation() {
  useEffect(() => {
    const SELECTOR = "[data-reveal], [data-reveal-stagger]";

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const revealAll = () =>
      document
        .querySelectorAll<HTMLElement>(SELECTOR)
        .forEach((n) => n.classList.add("is-visible"));

    if (prefersReduced) {
      revealAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    const observeNew = () =>
      document
        .querySelectorAll<HTMLElement>(SELECTOR)
        .forEach((n) => {
          if (!n.classList.contains("is-visible")) io.observe(n);
        });

    observeNew();

    // Catch elements mounted after the first paint (Suspense, client nav).
    const mo = new MutationObserver(() => observeNew());
    mo.observe(document.body, { childList: true, subtree: true });

    // Never leave content hidden if something slips past the observer.
    const safety = window.setTimeout(revealAll, 1600);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(safety);
    };
  }, []);
}
