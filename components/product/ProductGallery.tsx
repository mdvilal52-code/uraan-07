"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : ["/images/necklace.jpg"];

  return (
    <section className="px-5 pt-3" data-reveal>
      {/* Main image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-cream-200">
        <Image
          src={list[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 440px"
          className="object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="mt-2.5 flex gap-2">
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square w-[22%] overflow-hidden rounded-xl border-2 transition ${
                i === active
                  ? "border-gold-400 shadow-gold"
                  : "border-cream-300 opacity-70"
              }`}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
