"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  coverImage: string | null;
  lowestPrice: number | null;
  currency: string;
}

interface SearchBarProps {
  variant?: "hero" | "header";
  placeholder?: string;
}

export default function SearchBar({
  variant = "header",
  placeholder = "Spiel suchen... z.B. 'FC 25'",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const isHero = variant === "hero";

  return (
    <div ref={wrapperRef} className="relative z-50 w-full">
      <div
        className={
          isHero
            ? "flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-sm"
            : "flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2 bg-white/5"
        }
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={
            isHero
              ? "w-full bg-transparent text-white placeholder-gray-500 outline-none px-4 py-3 text-base"
              : "w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          }
        />
        {isLoading && (
          <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {isHero && (
          <button
            onClick={() => {
              if (results.length === 1) {
                window.location.href = `/game/${results[0].slug}`;
              }
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shrink-0"
          >
            Suchen
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[80] mt-2 max-h-[22rem] overflow-y-auto rounded-xl border border-white/10 bg-[#141427] shadow-2xl">
          {results.length === 0 && query.length >= 2 && !isLoading ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              Kein Spiel gefunden für &quot;{query}&quot;
            </div>
          ) : (
            results.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.slug}`}
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="grid min-h-[64px] grid-cols-[40px_minmax(0,1fr)_92px] items-center gap-3 border-b border-white/5 px-4 py-3 transition-colors last:border-b-0 hover:bg-white/5"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-gray-900 overflow-hidden shrink-0">
                  {game.coverImage ? (
                    <img
                      src={game.coverImage}
                      alt={game.name}
                      className="w-full h-full object-contain p-0.5"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      ?
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 overflow-hidden text-left">
                  <div className="truncate pr-2 text-sm font-medium leading-snug text-white">
                    {game.name}
                  </div>
                </div>

                {/* Price */}
                <div className="whitespace-nowrap text-right text-sm font-bold text-pink-400">
                  {game.lowestPrice != null
                    ? `ab ${game.lowestPrice.toFixed(2)} ${game.currency}`
                    : ""}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
