import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown, Scissors, Globe } from "lucide-react";

interface Podcast {
  id: number | string;
  title: string;
  author?: string;
  image?: string;
  link?: string;
  url?: string;
  feedUrl?: string;
  description?: string;
  reasoning?: string;
}

interface Episode {
  guid: string | null;
  title: string;
  description: string;
  pubDate: string | null;
  link: string | null;
  mediaUrl: string;
  mediaType: string | null;
  image: string | null;
  duration: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  podcast: Podcast | null;
}

const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? "https://pods-backend-kom3.onrender.com";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "Unknown Date";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? "Unknown Date"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const normalizeUrl = (u?: string | null) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u.replace(/^http:\/\//i, "https://");
  return `https://${u}`;
};

const looksLikeRss = (u: string) =>
  /\.xml(\?|$)/i.test(u) || /rss/i.test(u) || /feed/i.test(u);

const looksLikeMedia = (u: string) =>
  /\.(mp3|m4a|aac|wav|ogg|oga|flac|mp4|m4v)$/i.test(u);

async function resolveFeedUrl(podcast: Podcast, signal?: AbortSignal): Promise<string | null> {
  const firstGuess =
    normalizeUrl(podcast.feedUrl) ||
    normalizeUrl(podcast.url) ||
    normalizeUrl(podcast.link);

  if (firstGuess && looksLikeRss(firstGuess)) return firstGuess;
  if (!podcast?.title) return firstGuess || null;

  const searchRes = await fetch(
    `${API_BASE}/search/${encodeURIComponent(podcast.title)}`,
    { signal }
  );
  if (!searchRes.ok) return firstGuess || null;

  const data = await searchRes.json();
  const feeds: any[] = Array.isArray(data.feeds) ? data.feeds : [];

  const exact = feeds.find(
    (f) => f?.title?.trim()?.toLowerCase() === podcast.title.trim().toLowerCase()
  );
  const byAuthor =
    !exact &&
    podcast.author &&
    feeds.find(
      (f) =>
        f?.author?.trim()?.toLowerCase() === podcast.author!.trim().toLowerCase()
    );

  const candidate = exact || byAuthor || feeds[0];
  const resolved =
    normalizeUrl(candidate?.feedUrl) ||
    normalizeUrl(candidate?.url) ||
    null;

  return resolved;
}

export default function PodcastModal({ open, onClose, podcast }: Props) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEp, setDetailEp] = useState<Episode | null>(null);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<"clip" | "translate" | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Record<string, Episode[]>>({});

  const baseGuess = useMemo(() => {
    if (!podcast) return "";
    const guess = podcast.feedUrl || podcast.url || podcast.link || "";
    return normalizeUrl(guess);
  }, [podcast]);

  const isDirectMedia = useMemo(() => looksLikeMedia(baseGuess), [baseGuess]);

  useEffect(() => {
    if (!open || !podcast) return;

    if (isDirectMedia) {
      setEpisodes([
        {
          guid: String(podcast.id ?? "1"),
          title: podcast.title || "Media",
          description: podcast.description || "",
          pubDate: new Date().toISOString(),
          link: baseGuess,
          mediaUrl: baseGuess,
          mediaType: baseGuess.endsWith(".mp4") || baseGuess.endsWith(".m4v")
            ? "video/mp4"
            : "audio/mpeg",
          image: podcast.image || null,
          duration: null,
        },
      ]);
      setActiveIdx(0);
      setError(null);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const feedUrl =
          (baseGuess && looksLikeRss(baseGuess) && baseGuess) ||
          (await resolveFeedUrl(podcast, controller.signal));

        if (!feedUrl) {
          setEpisodes([]);
          setError("Unable to resolve a valid RSS feed for this podcast.");
          return;
        }

        if (cacheRef.current[feedUrl]) {
          setEpisodes(cacheRef.current[feedUrl]);
          setActiveIdx(0);
          return;
        }

        const res = await fetch(
          `${API_BASE}/episodes?feedUrl=${encodeURIComponent(feedUrl)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const eps: Episode[] = Array.isArray(data.episodes)
          ? data.episodes
              .filter((e) => e?.mediaUrl)
              .map((e) => ({
                guid: e.guid ?? null,
                title: e.title ?? "Untitled Episode",
                description: e.description ?? "",
                pubDate: e.pubDate ?? null,
                link: e.link ?? null,
                mediaUrl: normalizeUrl(e.mediaUrl),
                mediaType: e.mediaType || "audio/mpeg",
                image: e.image ?? podcast.image ?? null,
                duration: e.duration ?? null,
              }))
          : [];

        if (!eps.length) throw new Error("No playable episodes returned");

        cacheRef.current[feedUrl] = eps;
        setEpisodes(eps);
        setActiveIdx(0);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setEpisodes([]);
        setActiveIdx(0);
        setError("Unable to load episodes for this podcast.");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [open, podcast, baseGuess, isDirectMedia]);

  const onLikeToggle = (isLike: boolean) =>
    setLiked((prev) => (prev === isLike ? null : isLike));

  const ep = episodes[activeIdx];
  const isVideo = (mt?: string | null) => (mt ?? "").toLowerCase().includes("video");

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-3xl bg-neutral-950 text-white border border-neutral-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {podcast?.title || "Podcast"}
            </DialogTitle>
            {podcast?.author && (
              <p className="text-neutral-400 text-sm">{podcast.author}</p>
            )}
            {podcast?.reasoning && (
              <p className="text-neutral-400 text-xs mt-1">{podcast.reasoning}</p>
            )}
            <DialogDescription className="sr-only">Podcast modal</DialogDescription>
          </DialogHeader>

         <div className="flex justify-center items-center gap-6 mt-3 mb-6">

  {/* PodsAI Clips */}
  <div className="flex flex-col items-center gap-1">
    <button
      onClick={() => {
        setComingSoonFeature("clip");
        setComingSoonOpen(true);
      }}
      className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition flex items-center justify-center"
      title="Generate AI Clip"
    >
      <Scissors size={22} className="text-white" />
    </button>
    <p className="text-[11px] text-neutral-400">PodsAI Clips</p>
  </div>

  {/* Like */}
  <button
    onClick={() => onLikeToggle(true)}
    className={`p-2 rounded-full transition ${
      liked === true ? "bg-fuchsia-600" : "bg-neutral-800 hover:bg-neutral-700"
    }`}
    title="Like"
  >
    <ThumbsUp size={18} />
  </button>

  {/* Dislike */}
  <button
    onClick={() => onLikeToggle(false)}
    className={`p-2 rounded-full transition ${
      liked === false ? "bg-red-600" : "bg-neutral-800 hover:bg-neutral-700"
    }`}
    title="Dislike"
  >
    <ThumbsDown size={18} />
  </button>

  {/* PodsAI Translate */}
  <div className="flex flex-col items-center gap-1">
    <button
      onClick={() => {
        setComingSoonFeature("translate");
        setComingSoonOpen(true);
      }}
      className="p-3 rounded-full bg-neutral-800 hover:bg-neutral-700 transition flex items-center justify-center"
      title="Live Translation"
    >
      <Globe size={22} className="text-white" />
    </button>
    <p className="text-[11px] text-neutral-400">PodsAI Translate</p>
  </div>

</div>

          {loading && (
            <p className="text-neutral-400 mt-2 text-center">Loading episodes…</p>
          )}
          {error && (
            <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
          )}

          {ep && !loading && (
            <div className="space-y-3 mt-4">
              <div className="aspect-video w-full bg-black/40 rounded-lg overflow-hidden flex items-center justify-center">
                {isVideo(ep.mediaType) ? (
                  <video
                    key={ep.mediaUrl}
                    src={ep.mediaUrl}
                    controls
                    preload="metadata"
                    className="w-full h-full"
                  />
                ) : (
                  <audio
                    key={ep.mediaUrl}
                    src={ep.mediaUrl}
                    className="w-full"
                    controls
                    preload="metadata"
                  />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold leading-tight line-clamp-2">
                  {ep.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {formatDate(ep.pubDate)}
                </p>
              </div>
            </div>
          )}

          {episodes.length > 1 && (
            <div className="mt-5 max-h-64 overflow-y-auto space-y-2 pr-1 rounded-md">
              {episodes.map((e, i) => (
                <div
                  key={e.guid || `${e.mediaUrl}-${i}`}
                  className={`group p-2 rounded-md border transition cursor-pointer ${
                    i === activeIdx
                      ? "border-fuchsia-500/70 bg-fuchsia-500/10"
                      : "border-neutral-800 hover:bg-neutral-800/60"
                  }`}
                  onClick={() => setActiveIdx(i)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{e.title}</div>
                      <div className="text-xs text-neutral-400">{formatDate(e.pubDate)}</div>
                    </div>

                    {e.description && (
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setDetailEp(e);
                          setDetailOpen(true);
                        }}
                        className="text-[11px] text-fuchsia-300 hover:text-fuchsia-100 shrink-0"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg bg-neutral-950 text-gray-100 border border-neutral-800 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {detailEp?.title}
            </DialogTitle>
            <p className="text-xs text-gray-400 mb-2">
              {formatDate(detailEp?.pubDate)}
            </p>
          </DialogHeader>

          {detailEp?.image && (
            <img
              src={normalizeUrl(detailEp.image)}
              alt={detailEp.title || ""}
              className="w-full h-48 object-cover rounded-md mb-3"
            />
          )}

          <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed break-words">
            {detailEp?.description || "No description available."}
          </p>

          {detailEp?.mediaUrl && (
            <div className="mt-4">
              {isVideo(detailEp.mediaType) ? (
                <video
                  src={detailEp.mediaUrl}
                  controls
                  preload="metadata"
                  className="w-full rounded-md"
                />
              ) : (
                <audio
                  src={detailEp.mediaUrl}
                  controls
                  preload="metadata"
                  className="w-full"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
        <DialogContent className="max-w-md bg-neutral-950 text-gray-100 border border-neutral-800 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {comingSoonFeature === "translate"
                ? "Live Translation"
                : "AI Clip Generator"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-300 mt-2">
            Coming Soon! Exclusive on Pods
          </p>

          <p className="text-sm text-gray-400 mt-4 leading-relaxed">
            {comingSoonFeature === "translate" ? (
              <>Clip
                PodsAi presents live translation! Listen to your favorite
                podcast in the language of your choice, instantly and
                naturally. Experience your favorite hosts across languages
                with real time translation 
              </>
            ) : (
              <>
                 PodsAi presents clip generation! We understand you dont always have time to listen to your favourite podcast. With this feature you can turn any podcast episode
                into AI crafted clips. Get a quick summary, hear
                the most replayed moments, or create your own clip of the podcast (very easy) and share to Instagram, Tiktok, X and more!
              </>
            )}
          </p>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setComingSoonOpen(false)}
              className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}