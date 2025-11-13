import React, { useEffect, useState } from "react";
import PodcastCard from "./PodcastCard";
import PodcastModal from "./PodcastModal";
import { usePodcastCache } from "@/context/PodcastCacheContext";

const API_BASE =
  import.meta.env.VITE_API_BASE?.trim() || "http://127.0.0.1:4000";

interface Podcast {
  id: string | number;
  title: string;
  author?: string;
  image?: string;
  link?: string;
  url?: string;
  description?: string;
}

interface Props {
  title: string;
  endpoint: string;
  limit?: number;
}

export default function CategoryRow({ title, endpoint, limit = 10 }: Props) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Podcast | null>(null);
  const { getCache, setCache } = usePodcastCache();

  useEffect(() => {
    const cacheKey = `category:${endpoint}`;
    const cached = getCache(cacheKey);
    if (cached) {
      setPodcasts(cached);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const url =
          endpoint.startsWith("http") || endpoint.startsWith(API_BASE)
            ? endpoint
            : `${API_BASE}/${endpoint.replace(/^\/+/, "")}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const items =
          data.feeds || data.podcasts || data.trending || data.items || [];

        const clean = items
          .slice(0, limit)
          .filter((p: any) => p && (p.title || p.id))
          .map((p: any) => ({
            id: p.id ?? p.feedId ?? p.url ?? p.link,
            title: p.title ?? "Untitled",
            author: p.author ?? p.itunesAuthor ?? "Unknown",
            image: p.image ?? p.artwork ?? "/default_podcast.jpg",
            link: p.link ?? p.url ?? "",
            url: p.url ?? p.link ?? "",
            description: p.description ?? "",
          }));

        setPodcasts(clean);
        setCache(cacheKey, clean);
      } catch (err: any) {
        if (err.name !== "AbortError") setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [endpoint, title, getCache, setCache, limit]);

  if (loading)
    return <div className="p-6 text-sm text-gray-400">Loading {title}...</div>;

  if (error)
    return (
      <div className="p-6 text-sm text-red-500">
        {error} ({title})
      </div>
    );

  if (!podcasts.length)
    return (
      <div className="p-6 text-sm text-gray-500">
        No podcasts found for {title}.
      </div>
    );

  return (
    <>
      <section className="mt-12 mb-10 px-5 md:px-10">
        {/* Section title */}
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-100 tracking-tight">
          {title}
        </h2>

        {/* Horizontal scroll row */}
        <div
          className="flex gap-5 md:gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory
                     scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900/30 
                     hover:scrollbar-thumb-gray-500 transition-all duration-300 rounded-lg"
        >
          {podcasts.map((pod) => (
            <div
              key={pod.id}
              className="flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 snap-start hover:scale-[1.03] transition-transform duration-200 ease-out"
            >
              <PodcastCard podcast={pod} onClick={() => setSelected(pod)} />
            </div>
          ))}
        </div>
      </section>

      {/* Podcast modal */}
      {selected && (
        <PodcastModal
          open={!!selected}
          onClose={() => setSelected(null)}
          podcast={selected}
        />
      )}
    </>
  );
}