import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CategoryRow from "@/components/ui/CategoryRow";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:4000";

// --- Extra categories (only these show here) ---
const CATEGORIES = [
  { name: "Business", q: "business" },
  { name: "Health", q: "health" },
  { name: "Comedy", q: "comedy" },
  { name: "History", q: "history" },
  { name: "Science", q: "science" },
  { name: "Finance", q: "finance" },
  { name: "Self-Improvement", q: "self improvement" },
];

// --- Build fast endpoint (simple & safe) ---
function buildEndpoint(cat: (typeof CATEGORIES)[number], limit = 12) {
  return `${API_BASE}/podcasts/search?q=${encodeURIComponent(cat.q)}&limit=${limit}`;
}

export default function CategorySelectRow() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="space-y-6">
      {/* Simple horizontal list of categories (no highlight/animation) */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pb-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.q}
            variant="outline"
            size="lg"
            className="
              rounded-full px-6 py-3 text-base sm:text-lg font-medium
              whitespace-nowrap bg-neutral-900/80 border border-neutral-700
              text-neutral-200 hover:text-fuchsia-400 hover:border-fuchsia-500
              hover:bg-neutral-800/80 transition-colors duration-150
              shadow-sm
            "
            onClick={() => setSelected(cat.q === selected ? null : cat.q)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Load the row only when clicked */}
      {selected && (
        <div className="mt-4">
          <CategoryRow
            title={CATEGORIES.find((c) => c.q === selected)?.name ?? ""}
            endpoint={buildEndpoint(
              CATEGORIES.find((c) => c.q === selected)!,
              10
            )}
          />
        </div>
      )}
    </section>
  );
}