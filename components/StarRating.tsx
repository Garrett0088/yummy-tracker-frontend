"use client";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (stars: number) => void;
  readOnly?: boolean;
  size?: "sm" | "lg";
}

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "lg",
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const sizeClass = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered ?? value);
        const colorClass = filled ? "text-orange-400" : "text-stone-300";

        if (readOnly) {
          return (
            <span key={star} className={`${sizeClass} ${colorClass} leading-none`}>
              {filled ? "★" : "☆"}
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className={`${sizeClass} ${colorClass} leading-none cursor-pointer transition-transform hover:scale-110`}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
