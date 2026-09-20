"use client";
import { useState } from "react";

export function Gallery({
  images,
  videoUrl,
  name,
}: {
  images: string[];
  videoUrl?: string | null;
  name: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : ["https://picsum.photos/800/600"];

  return (
    <div>
      <div className="glass rounded-2xl overflow-hidden aspect-[4/3] bg-black/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={list[active]}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {list.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
              active === i ? "border-violet-500" : "border-transparent opacity-60"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {videoUrl && (
        <div className="mt-4 glass rounded-2xl p-3">
          <video src={videoUrl} controls className="w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
