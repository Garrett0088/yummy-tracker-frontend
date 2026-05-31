"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

const CATEGORIES = ["Drink", "Dish", "Dessert", "Other"];

export default function AddItemPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", restaurant: "", category: "Drink" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      router.push("/");
    } catch {
      setError("The chef said something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Add New Item</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <label className="text-sm font-medium text-stone-600 block mb-1">
              Item Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Peach Green Tea Latte"
              className="border border-stone-200 rounded-lg px-3 py-2 w-full text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-600 block mb-1">
              Restaurant
            </label>
            <input
              required
              value={form.restaurant}
              onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
              placeholder="e.g. Starbucks"
              className="border border-stone-200 rounded-lg px-3 py-2 w-full text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-600 block mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-stone-200 rounded-lg px-3 py-2 w-full text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add Item"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-stone-100 text-stone-700 px-6 py-2.5 rounded-lg font-medium hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
