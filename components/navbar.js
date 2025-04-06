// /components/NavBar.js
"use client";  // Only use this if you're using client-side logic
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 w-full p-4 bg-black text-white flex justify-center space-x-4">
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/features">Features</Link>
      <Link href="/pricing">Pricing</Link>
      <Link href="/contact">Contact</Link>
    </nav>
  );
}
