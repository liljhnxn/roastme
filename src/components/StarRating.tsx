"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 0 to 5 (can be decimal for display)
  onChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  onChange,
  interactive = false,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = activeRating >= star;
        const isHalf = !isFilled && activeRating >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={cn(
              "transition-all duration-150 focus:outline-none",
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default",
              !interactive && "pointer-events-none"
            )}
            aria-label={`${star} star`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                  : isHalf
                  ? "fill-amber-400/50 text-amber-400"
                  : "text-charcoal-600 fill-transparent hover:text-charcoal-500"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

