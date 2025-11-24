import React, { useRef, useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Compass, Headphones, Mic, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import PodcastCard from "@/components/ui/PodcastCard";
import PodcastModal from "@/components/ui/PodcastModal";
import SwipeCard from "@/components/ui/SwipeCard";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

// API Base
const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:4000";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

// Types
interface PodcastResult {
  podcastTitle?: string;
  author?: string;
  episodeTitle?: string;
  episodeLink?: string;
  summary?: string;
  image?: string;
  reasoning?: string;
}

interface AIResponse {
  found: boolean;
  summaryResponse?: string;
  message?: string;
  results?: PodcastResult[];
}

interface AIPodcast {
  id?: string | number;
  title: string;
  author?: string;
  image?: string;
  link?: string;
  description?: string;
  reasoning?: string;
}

const SUGGESTIONS = [
  "Everything AI",
  "Space Exploration Podcasts",
  "Learn how to Invest",
  "UFC Analysis",
  "History of Rome",
];

const DiscoverBox: React.FC = () => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AIPodcast[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inflight = useRef<AbortController | null>(null);

  const [selected, setSelected] = useState<AIPodcast | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Swipe Mode State
  const [swipeMode, setSwipeMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset swipe mode state when items change
  useEffect(() => {
    if (items.length > 0) {
      setSwipeMode(true);
      setCurrentIndex(0);
    }
  }, [items]);

  // Swipe complete -> return to grid
  useEffect(() => {
    if (swipeMode && currentIndex >= items.length) {
      setSwipeMode(false);
    }
  }, [currentIndex, items.length, swipeMode]);

  const runAISearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setError(null);
    setAiSummary(null);
    setItems([]);
    setSwipeMode(false);
    setCurrentIndex(0);
    setAiThinking(true);
    setLoading(true);

    if (inflight.current) inflight.current.abort();
    inflight.current = new AbortController();

    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/ai-discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
        signal: inflight.current.signal,
        timeout: 30000,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: AIResponse = await res.json();

      if (data.found) {
        setAiSummary(data.summaryResponse || null);

        const results = Array.isArray(data.results) ? data.results : [];
        setItems(
          results.map((r, i) => ({
            id: i,
            title: r.podcastTitle || "Unknown Podcast",
            author: r.author || "Unknown Author",
            description: r.summary || "No description available.",
            link: r.episodeLink || "",
            image:
              r.image || "https://cdn-icons-png.flaticon.com/512/4712/4712027.png",
            reasoning: r.reasoning,
          }))
        );
      } else {
        setError(data.message || "No matching podcasts found.");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("AI Discover failed:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setAiThinking(false);
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAISearch(query);
  };

  const useSuggestion = (s: string) => {
    setQuery(s);
    runAISearch(s);
  };

  const openModal = (podcast: AIPodcast) => {
    setSelected(podcast);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-16 flex flex-col items-center">

      <div className="flex flex-col items-center mb-10">
        <Link
          to="/"
          className="flex items-center justify-center gap-3 mb-3 hover:opacity-90 transition-opacity"
        >
          <Headphones className="h-10 w-10 text-fuchsia-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]" />
          <h1 className="text-5xl font-semibold tracking-tight">
            Pods
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500">
              …
            </span>
          </h1>
        </Link>

        <div className="flex items-center justify-center gap-4">
          {[
            { to: "/discover", label: "Discover", icon: Compass },
            { to: "/", label: "Listen", icon: Headphones },
            { to: "/create", label: "Create", icon: Mic },
          ].map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg"
                    : "bg-neutral-800/60 text-neutral-300 hover:text-white hover:bg-neutral-700/60"
                }`
              }
            >
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-3xl rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md shadow-2xl p-8 sm:p-10 transition focus-within:shadow-[0_0_60px_10px_rgba(168,85,247,0.25)]"
      >
        <label className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
          <Search className="h-4 w-4 text-fuchsia-400" />
          Discover anything you want to hear, PodsAi will find the right podcast for you
        </label>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try: "Elon Musk talking about rocketships"'
          className="w-full text-lg sm:text-xl bg-transparent outline-none text-white placeholder:text-neutral-500 border-b border-neutral-800 pb-2 focus:border-fuchsia-500 transition"
        />

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <Button
                key={s}
                type="button"
                variant="secondary"
                onClick={() => useSuggestion(s)}
                className="rounded-full bg-neutral-800/60 text-sm hover:bg-fuchsia-600/30 hover:text-fuchsia-300 transition-colors"
              >
                {s}
              </Button>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-8 py-2 rounded-xl text-lg flex items-center gap-2 hover:opacity-90 transition"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      <div className="mt-6 h-8 text-center min-h-[1.5rem]">
        {aiThinking && (
          <p className="text-neutral-400 italic animate-pulse">
            Finding the best podcasts for you...
          </p>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 text-center max-w-md">{error}</p>
      )}

      {swipeMode && items.length > 0 ? (
      <div className="mt-16 w-full flex flex-col items-center gap-6">

       <p className="text-neutral-400 text-sm max-w-md text-center leading-relaxed">
          PodsAi found these podcasts based on your search. Listen to a match or skip to discover the next recommendation.
       </p>

      <SwipeCard
      feed={items[currentIndex]}
      onSkip={() => setCurrentIndex((i) => i + 1)}
      onOpen={() => openModal(items[currentIndex])}
      />
     </div>
      ) : (
        <div className="w-full max-w-6xl mt-10 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="group relative">
              <PodcastCard podcast={p} onClick={() => openModal(p)} />
              {p.reasoning && (
                <p className="text-xs text-neutral-400 mt-2 px-2 italic opacity-80">
                  {p.reasoning}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <p className="text-neutral-500 mt-20 text-center max-w-md">
          Stay curious. Keep listening. Discover what you like with PodsAi.
        </p>
      )}

      {selected && (
        <PodcastModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          podcast={selected as any}
        />
      )}
    </div>
  );
};

export default DiscoverBox;