import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CategoryRow from "@/components/ui/CategoryRow";
import { useNavigate } from "react-router-dom";

// Categories (Home included)
const CATEGORIES = [
  { name: "Home", q: null },
  { name: "Business", q: "business" },
  { name: "Health", q: "health" },
  { name: "Comedy", q: "comedy" },
  { name: "History", q: "history" },
  { name: "Science", q: "science" },
  { name: "Finance", q: "finance" },
  { name: "Self-Improvement", q: "self improvement" },
];

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:4000";

function buildEndpoint(query: string, limit = 12) {
  return `${API_BASE}/search/${encodeURIComponent(query)}?limit=${limit}`;
}

export default function CategorySelectRow() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleClick = (cat: (typeof CATEGORIES)[number]) => {
    if (cat.q === null) {
      // Reset to home-like state
      setSelected(null);

      // Instead of navigating (which breaks UI), simply reset categories
      navigate("/", { replace: false });

      return;
    }

    setSelected(cat.q);
  };

  return (
    <section className="space-y-6">
      {/* CATEGORY BUTTONS */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pb-2">
        {CATEGORIES.map((cat) => {
          const isActive =
            (cat.q === null && selected === null) || selected === cat.q;

          return (
            <Button
              key={cat.name}
              size="lg"
              className={`
                rounded-full px-6 py-3 text-base sm:text-lg font-medium whitespace-nowrap
                border transition-colors duration-150 shadow-sm
                ${
                  isActive
                    ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-fuchsia-700 shadow-lg"
                    : "bg-neutral-900/80 border-neutral-700 text-neutral-300 hover:text-white hover:border-fuchsia-500 hover:bg-neutral-800/80"
                }
              `}
              onClick={() => handleClick(cat)}
            >
              {cat.name}
            </Button>
          );
        })}
      </div>

      {/* CATEGORY RESULTS */}
      {selected && (
        <div className="mt-4">
          <CategoryRow
            title={
              CATEGORIES.find((c) => c.q === selected)?.name || "Results"
            }
            endpoint={buildEndpoint(selected, 12)}
          />
        </div>
      )}
    </section>
  );
}