import React from "react";
import { Button } from "@/components/ui/button";

interface SwipeCardProps {
  feed: {
    id?: string | number;
    title: string;
    author?: string;
    image?: string;
    description?: string;
    reasoning?: string;
  };
  onSkip: () => void;
  onOpen: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ feed, onSkip, onOpen }) => {
  if (!feed) return null;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 shadow-2xl p-5 sm:p-6 flex flex-col">
        <div className="w-full mb-4">
          <img
            src={feed.image}
            alt={feed.title}
            className="w-full aspect-square sm:h-64 object-cover rounded-2xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              {feed.title}
            </h2>
            {feed.author && (
              <p className="text-sm text-neutral-400 mt-1">{feed.author}</p>
            )}
          </div>

          {feed.description && (
            <p className="text-sm text-neutral-200 mt-2 line-clamp-4">
              {feed.description}
            </p>
          )}

          {feed.reasoning && (
            <p className="text-xs text-neutral-400 mt-3 italic">
              {feed.reasoning}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1 border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          >
            Skip
          </Button>
          <Button
            onClick={onOpen}
            className="flex-1 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white hover:opacity-90"
          >
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;