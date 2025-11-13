// src/components/ui/PodcastSearch.tsx
import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Feed {
  id: string | number;
  title: string;
  author?: string;
  image?: string;
  url?: string;
}

interface Episode {
  id?: string | number;
  title: string;
  pubDate?: string;
  enclosureUrl?: string;
  datePublished?: number;
}

export default function PodcastSearch() {
  const [term, setTerm] = useState("ufc");
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [likedMap, setLikedMap] = useState<Record<string | number, boolean | null>>({});

  const API_BASE = import.meta.env.VITE_API_BASE?.trim() || "http://127.0.0.1:4000";

  // 🔍 Search podcasts
  const search = async () => {
    try {
      const res = await fetch(`${API_BASE}/podcasts/search?q=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const json = await res.json();
      setFeeds(json.podcasts || []);
      setEpisodes([]);
    } catch (err) {
      console.error("❌ Error searching podcasts:", err);
      setFeeds([]);
    }
  };

  // ❤️ Like or dislike handler (per podcast)
  const handleLike = async (podcastId: string | number, likedValue: boolean) => {
    setLikedMap((prev) => ({ ...prev, [podcastId]: likedValue }));
    try {
      await fetch(`${API_BASE}/podcasts/${podcastId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "guest", liked: likedValue }),
      });
    } catch (err) {
      console.error("❌ Failed to like:", err);
    }
  };

  // 🎧 Load episodes for a specific podcast
  const loadEpisodes = async (feedId: string | number) => {
    try {
      const res = await fetch(`${API_BASE}/podcasts/episodes?feedId=${feedId}`);
      if (!res.ok) throw new Error(`Episodes fetch failed: ${res.status}`);
      const json = await res.json();
      setEpisodes(json.items || []);
    } catch (err) {
      console.error("❌ Error loading episodes:", err);
      setEpisodes([]);
    }
  };

  // 🚀 Initial search
  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 space-y-6 text-white bg-neutral-950 min-h-screen">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          className="border border-neutral-700 rounded px-3 py-2 w-full bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search podcasts..."
        />
        <button
          className="px-4 rounded bg-fuchsia-600 hover:bg-fuchsia-700 transition text-white font-medium"
          onClick={search}
        >
          Search
        </button>
      </div>

      {/* Feeds grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {feeds.map((f) => (
          <div
            key={f.id}
            className="relative text-left p-3 border border-neutral-800 rounded-lg hover:bg-neutral-900/60 transition"
          >
            {f.image && (
              <img
                src={f.image}
                alt={f.title}
                className="w-full h-40 object-cover rounded mb-2"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}

            <div className="font-semibold text-white line-clamp-1">{f.title}</div>
            <div className="text-sm text-neutral-400 line-clamp-1">{f.author}</div>

            {/* Like / Dislike controls */}
            <div className="flex justify-start items-center gap-2 mt-2">
              <button
                className={`p-1.5 rounded transition ${
                  likedMap[f.id] === true
                    ? "bg-blue-600"
                    : "bg-neutral-800 hover:bg-neutral-700"
                }`}
                onClick={() => handleLike(f.id, true)}
              >
                <ThumbsUp size={16} />
              </button>
              <button
                className={`p-1.5 rounded transition ${
                  likedMap[f.id] === false
                    ? "bg-red-600"
                    : "bg-neutral-800 hover:bg-neutral-700"
                }`}
                onClick={() => handleLike(f.id, false)}
              >
                <ThumbsDown size={16} />
              </button>
            </div>

            <button
              onClick={() => loadEpisodes(f.id)}
              className="mt-3 text-xs text-fuchsia-400 hover:underline"
            >
              View Episodes
            </button>
          </div>
        ))}
      </div>

      {/* Episodes list */}
      {episodes.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="font-semibold text-xl text-fuchsia-400">Episodes</h3>
          <ul className="space-y-2">
            {episodes.map((ep, idx) => (
              <li
                key={ep.id || idx}
                className="p-3 border border-neutral-800 rounded-lg bg-neutral-900/40"
              >
                <div className="font-medium text-white line-clamp-1">{ep.title}</div>
                <div className="text-sm text-neutral-400">
                  {new Date(
                    ((ep.datePublished ?? ep.pubDate ?? 0) as any) * 1000
                  ).toLocaleString()}
                </div>
                {ep.enclosureUrl && (
                  <audio controls src={ep.enclosureUrl} className="mt-2 w-full" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}