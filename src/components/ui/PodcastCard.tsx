import React from "react";

interface PodcastCardProps {
  podcast: {
    id: number | string;
    title: string;
    author?: string;
    image?: string;
    link?: string;
    url?: string;
    description?: string;
  };
  onClick?: () => void;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer flex flex-col text-gray-100"
    >
      {/* Cover */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md shadow-sm">
        <img
          src={podcast.image}
          alt={podcast.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Text */}
      <div className="mt-2 leading-tight">
        <h3 className="text-xs md:text-sm font-medium line-clamp-2">
          {podcast.title}
        </h3>
        <p className="text-[11px] text-gray-400 line-clamp-1">
          {podcast.author}
        </p>
      </div>
    </div>
  );
};

export default PodcastCard;