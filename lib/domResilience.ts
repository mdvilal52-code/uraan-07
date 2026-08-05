/* ============================================================
   DOM-resilience guard against extension-induced React crashes.
   ------------------------------------------------------------
   Browser translation (Google Translate is the usual culprit on an
   Arabic / RTL page like this one) rewrites the DOM out from under
   React: it wraps each text node in a <font> tag, which changes that
   text node's parent. React still holds a reference to the original
   text node as a sibling, so on the next commit — e.g. a button
   toggling in a loading spinner right beside its label — React calls

       button.insertBefore(spinner, labelTextNode)

   but labelTextNode's parent is now the injected <font>, not the
   button. The browser throws

       NotFoundError: Failed to execute 'insertBefore' on 'Node':
       The node before which the new node is to be inserted is not a
       child of this node.

   which unwinds the whole React tree into the route error boundary —
   the "unexpected error" flash a customer saw when creating an account
   or tapping "Buy Now" while the page was translated.

   installDomResilience() makes the two DOM operations React relies on
   tolerant of a reference/target node that an extension has already
   reparented: instead of throwing, insertBefore appends (so React's
   belief that the node was placed still holds) and removeChild is a
   no-op. React then reconciles cleanly on its next render. The guard
   only ever changes behaviour in the case that would otherwise throw —
   the normal path calls straight through — so it is completely inert
   for every visitor who is not running such an extension.

   It is invoked from a client module (components/DomResilience) that is
   part of the initial bundle, so it installs when that bundle evaluates
   — before hydrateRoot() and therefore before the first commit that
   could hit a translated node.
   ============================================================ */

const FLAG = "__ariana_dom_resilience__";

export function installDomResilience(): void {
  // Server render (no DOM) and re-invocation are both no-ops.
  if (typeof Node !== "function" || !Node.prototype) return;
  const proto = Node.prototype as Node & Record<string, unknown>;
  if (proto[FLAG]) return;
  proto[FLAG] = true;

  const originalInsertBefore = proto.insertBefore;
  proto.insertBefore = function <T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      // The reference sibling was reparented (e.g. wrapped in <font> by a
      // translation extension). Append instead of throwing; React keeps a
      // consistent view and self-heals on the next render.
      try {
        return this.appendChild(newNode);
      } catch {
        return newNode;
      }
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };

  const originalRemoveChild = proto.removeChild;
  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child && child.parentNode !== this) {
      // Already detached/moved by the same kind of extension — nothing to do.
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };
}
