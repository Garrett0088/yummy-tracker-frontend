import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight hover:text-orange-100 transition-colors"
      >
        ☕ Yummy Tracker 🍽️
      </Link>
      <div className="flex gap-6 text-sm font-medium">
        <Link href="/" className="hover:text-orange-100 transition-colors">
          Home
        </Link>
        <Link href="/items/new" className="hover:text-orange-100 transition-colors">
          Add Item
        </Link>
      </div>
    </nav>
  );
}
