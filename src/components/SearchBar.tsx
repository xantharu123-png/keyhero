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
    <div ref={wrapperRef} className="relative w-full">
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-80 overflow-y-auto">
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
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                  {game.coverImage ? (
                    <img
                      src={game.coverImage}
                      alt={game.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      ?
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {game.name}
                  </div>
                </div>

                {/* Price */}
                {game.lowestPrice != null && (
                  <div className="text-pink-400 font-bold text-sm shrink-0">
                    ab {game.lowestPrice.toFixed(2)} {game.currency}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
