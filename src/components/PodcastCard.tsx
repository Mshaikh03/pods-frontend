import * as React from "react";

interface Podcast {
  id: number | string;
  title: string;
  author?: string;
  image?: string;
  link?: string;
  url?: string;
  description?: string;
}

interface PodcastCardProps {
  podcast: Podcast;
  onClick: () => void;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer flex flex-col items-center p-3 rounded-xl 
        bg-gray-900 text-white border border-transparent 
        hover:border-fuchsia-500/40 hover:shadow-lg hover:scale-[1.02]
        transition-transform duration-150 ease-out
      "
    >
      {podcast.image ? (
        <img
          src={podcast.image}
          alt={podcast.title}
          className="w-32 h-32 object-cover rounded-lg shadow-sm"
          loading="lazy"
        />
      ) : (
        <div className="w-32 h-32 flex items-center justify-center bg-gray-800 text-gray-400 text-xs rounded-lg">
          No Image
        </div>
      )}

      <h3 className="mt-2 text-sm font-semibold text-center line-clamp-2">
        {podcast.title}
      </h3>

      {podcast.author && (
        <p className="text-xs text-gray-400 line-clamp-1 mt-1">
          {podcast.author}
        </p>
      )}
    </div>
  );
};

export default React.memo(PodcastCard);