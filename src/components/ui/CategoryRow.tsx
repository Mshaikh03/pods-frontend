import React, { useEffect, useState, useRef } from "react";
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

export default function CategoryRow({ title, endpoint, limit = 20 }: Props) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Podcast | null>(null);

  const { getCache, setCache } = usePodcastCache();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Reset scroll when category changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setAtStart(true);
      setAtEnd(false);
    }
  }, [endpoint]);

  // Scroll arrows
  const scrollRow = (dir: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const amount = container.clientWidth * 0.8;

    container.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleScrollCheck = () => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    const pos = container.scrollLeft;

    setAtStart(pos <= 5);
    setAtEnd(pos >= maxScroll - 5);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    handleScrollCheck();
    container.addEventListener("scroll", handleScrollCheck);
    return () => container.removeEventListener("scroll", handleScrollCheck);
  }, []);

  // Fetch data
  useEffect(() => {
    const cacheKey = `category:${endpoint}`;

    const cached = getCache(cacheKey);
    if (cached) {
      setPodcasts(cached);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cleanEndpoint = endpoint.replace(/^\/+/, "");
        const url =
          endpoint.startsWith("http") || endpoint.startsWith(API_BASE)
            ? endpoint
            : `${API_BASE}/${cleanEndpoint}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = await res.json();

        const items =
          raw.feeds ||
          raw.podcasts ||
          raw.trending ||
          raw.items ||
          [];

        const cleaned = items
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

        setPodcasts(cleaned);
        setCache(cacheKey, cleaned);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError("Failed to load content");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [endpoint, limit, getCache, setCache]);

  return (
    <>
      <section className="mt-12 mb-10 px-5 md:px-10">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-100 tracking-tight">
          {title}
        </h2>

        {loading && (
          <div className="text-sm text-neutral-400 py-10">
            Loading {title}...
          </div>
        )}

        {error && !loading && (
          <div className="text-sm text-red-500 py-10">{error}</div>
        )}

        {!loading && !error && podcasts.length === 0 && (
          <div className="text-sm text-neutral-500 py-10">
            No podcasts found for {title}.
          </div>
        )}

        {!loading && !error && podcasts.length > 0 && (
          <div className="relative group w-full">
            {/* Left Arrow */}
            {!atStart && (
              <button
                onClick={() => scrollRow("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20
                  bg-neutral-900/80 hover:bg-neutral-800
                  h-10 w-10 rounded-full flex items-center justify-center
                  text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ‹
              </button>
            )}

            {/* Scrollable container */}
            <div
              ref={scrollRef}
              onScroll={handleScrollCheck}
              className="flex gap-5 md:gap-6 overflow-x-scroll no-scrollbar pb-6 scroll-smooth pr-6"
            >
              {podcasts.map((pod) => (
                <div
                  key={pod.id}
                  className="flex-shrink-0 w-28 sm:w-32 md:w-40 lg:w-44
                    hover:scale-[1.03] transition-transform duration-200 ease-out"
                >
                  <PodcastCard podcast={pod} onClick={() => setSelected(pod)} />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {!atEnd && (
              <button
                onClick={() => scrollRow("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20
                  bg-neutral-900/80 hover:bg-neutral-800
                  h-10 w-10 rounded-full flex items-center justify-center
                  text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ›
              </button>
            )}
          </div>
        )}
      </section>

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