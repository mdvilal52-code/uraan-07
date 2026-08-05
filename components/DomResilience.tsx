"use client";

import { installDomResilience } from "@/lib/domResilience";

// Runs when this client module is evaluated — which happens as the initial
// bundle loads, before React calls hydrateRoot(). That is early enough to
// protect every commit (the crash we guard against is triggered by a state
// update after hydration, e.g. a button toggling in its spinner), while a
// useEffect would only run after the first commit. On the server this call
// is a no-op (there is no DOM), so it is safe at module scope.
installDomResilience();

/** Renders nothing; it exists so the layout can pull the guard module into
 *  the initial client bundle. */
export function DomResilience() {
  return null;
}
