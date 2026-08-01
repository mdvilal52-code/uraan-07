import { Sparkles } from "lucide-react";

/**
 * Slim promotional bar. Not mounted by default (kept out of the shell to
 * match the reference), but available to drop above the navbar on
 * campaign pages: <AnnouncementBar />.
 */
export function AnnouncementBar({
  message = "شحن مجّاني على جميع الطلبات فوق AUD 500 — تسوّق الآن",
}: {
  message?: string;
}) {
  return (
    <div className="bar-sheen px-4 py-2 text-center text-[0.78rem] font-semibold text-cream-100">
      <span className="inline-flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-gold-200" />
        {message}
      </span>
    </div>
  );
}
