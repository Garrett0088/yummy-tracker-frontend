"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import type { Item } from "@/lib/types";
import StarRating from "@/components/StarRating";

const CATEGORY_EMOJI: Record<string, string> = {
  Drink: "☕",
  Dish: "🍽️",
  Dessert: "🍰",
  Other: "🍴",
};

function avgStars(reviews: Item["reviews"]): number | null {
  if (!reviews.length) return null;
  return Math.round(reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length);
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/items`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setItems)
      .catch(() => setError("The chef said something went wrong. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500 text-lg">
        🍳 Cooking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">My Yummy Log</h1>

      {items.length === 0 ? (
        <p className="text-stone-500">
          No items yet.{" "}
          <Link href="/items/new" className="text-orange-500 hover:underline">
            Add your first item!
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const avg = avgStars(item.reviews);
            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 hover:shadow-md hover:border-orange-300 transition-all flex flex-col gap-2"
              >
                <div className="text-4xl">{CATEGORY_EMOJI[item.category] ?? "🍴"}</div>
                <div className="font-bold text-stone-800 text-lg leading-tight">{item.name}</div>
                <div className="text-stone-500 text-sm">{item.restaurant}</div>
                <div className="mt-auto pt-2">
                  {avg !== null ? (
                    <StarRating value={avg} readOnly size="sm" />
                  ) : (
                    <span className="text-stone-400 text-xs italic">No reviews yet</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
