"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] root error boundary caught:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl" translate="no">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4ede1",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "24rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1f2a24" }}>
            حدث خطأ غير متوقع
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b6155" }}>
            نعتذر عن الإزعاج. حاولي إعادة تحميل الصفحة.
          </p>
          {error.digest && (
            <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#948a7c" }} dir="ltr">
              ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              width: "100%",
              borderRadius: "1rem",
              background: "#123125",
              color: "#f4ede1",
              padding: "0.9rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            أعد المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
