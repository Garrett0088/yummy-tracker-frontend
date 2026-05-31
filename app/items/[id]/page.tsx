"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import type { Item } from "@/lib/types";
import StarRating from "@/components/StarRating";

const CATEGORIES = ["Drink", "Dish", "Dessert", "Other"];

const CATEGORY_EMOJI: Record<string, string> = {
  Drink: "☕",
  Dish: "🍽️",
  Dessert: "🍰",
  Other: "🍴",
};

const DEFAULT_REVIEW = { stars: 4, status: "Tried", notes: "", date_tried: "" };

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", restaurant: "", category: "" });
  const [savingItem, setSavingItem] = useState(false);

  const [newReview, setNewReview] = useState(DEFAULT_REVIEW);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/items/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: Item) => {
        setItem(data);
        setEditForm({ name: data.name, restaurant: data.restaurant, category: data.category });
      })
      .catch(() => setError("The chef said something went wrong. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEditSave() {
    if (!item) return;
    setSavingItem(true);
    try {
      const res = await fetch(`${API_BASE}/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      const updated: Item = await res.json();
      setItem(updated);
      setEditing(false);
    } finally {
      setSavingItem(false);
    }
  }

  async function handleDeleteItem() {
    if (!item || !confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    await fetch(`${API_BASE}/items/${item.id}`, { method: "DELETE" });
    router.push("/");
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE}/items/${item.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stars: newReview.stars,
          status: newReview.status,
          notes: newReview.notes || null,
          date_tried: newReview.date_tried || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setItem({ ...item, reviews: [...item.reviews, created] });
      setNewReview(DEFAULT_REVIEW);
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleStarClick(reviewId: number, stars: number) {
    if (!item) return;
    // Optimistic update
    setItem({
      ...item,
      reviews: item.reviews.map((r) => (r.id === reviewId ? { ...r, stars } : r)),
    });
    await fetch(`${API_BASE}/reviews/${reviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars }),
    });
  }

  async function handleDeleteReview(reviewId: number) {
    if (!item) return;
    await fetch(`${API_BASE}/reviews/${reviewId}`, { method: "DELETE" });
    setItem({ ...item, reviews: item.reviews.filter((r) => r.id !== reviewId) });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500 text-lg">
        🍳 Cooking...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 text-lg">
        {error ?? "Item not found."}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Item header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
        {editing ? (
          <div className="flex flex-col gap-3">
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Item name"
              className="border border-stone-200 rounded-lg px-3 py-2 text-stone-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              value={editForm.restaurant}
              onChange={(e) => setEditForm({ ...editForm, restaurant: e.target.value })}
              placeholder="Restaurant"
              className="border border-stone-200 rounded-lg px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="border border-stone-200 rounded-lg px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleEditSave}
                disabled={savingItem}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {savingItem ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditForm({ name: item.name, restaurant: item.restaurant, category: item.category });
                }}
                className="bg-stone-100 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-4xl mb-2">{CATEGORY_EMOJI[item.category] ?? "🍴"}</div>
              <h1 className="text-2xl font-bold text-stone-800">{item.name}</h1>
              <p className="text-stone-500 mt-1">
                {item.restaurant} · {item.category}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="text-sm px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDeleteItem}
                className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews list */}
      <h2 className="text-lg font-semibold text-stone-700 mb-3">
        Reviews ({item.reviews.length})
      </h2>

      {item.reviews.length === 0 ? (
        <p className="text-stone-400 italic mb-6">No reviews yet. Add one below!</p>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {item.reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-orange-100 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5">
                  <StarRating
                    value={review.stars}
                    onChange={(stars) => handleStarClick(review.id, stars)}
                  />
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                      review.status === "Tried"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {review.status}
                  </span>
                  {review.notes && (
                    <p className="text-stone-600 text-sm">{review.notes}</p>
                  )}
                  {review.date_tried && (
                    <p className="text-stone-400 text-xs">{review.date_tried}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  title="Delete review"
                  className="text-stone-300 hover:text-red-400 text-lg transition-colors flex-shrink-0 leading-none"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add review form */}
      <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-stone-700 mb-4">Add a Review</h3>
        <form onSubmit={handleAddReview} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-stone-600 block mb-1">Stars</label>
            <StarRating
              value={newReview.stars}
              onChange={(stars) => setNewReview({ ...newReview, stars })}
            />
          </div>

          <div>
            <label className="text-sm text-stone-600 block mb-1">Status</label>
            <select
              value={newReview.status}
              onChange={(e) => setNewReview({ ...newReview, status: e.target.value })}
              className="border border-stone-200 rounded-lg px-3 py-2 w-full text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option>Tried</option>
              <option>Want to Try</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-stone-600 block mb-1">Notes</label>
            <textarea
              value={newReview.notes}
              onChange={(e) => setNewReview({ ...newReview, notes: e.target.value })}
              placeholder="How was it?"
              rows={3}
              className="border border-stone-200 rounded-lg px-3 py-2 w-full text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-stone-600 block mb-1">Date Tried</label>
            <input
              type="date"
              value={newReview.date_tried}
              onChange={(e) => setNewReview({ ...newReview, date_tried: e.target.value })}
              className="border border-stone-200 rounded-lg px-3 py-2 w-full text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            type="submit"
            disabled={submittingReview}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 self-start"
          >
            {submittingReview ? "Adding..." : "Add Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
