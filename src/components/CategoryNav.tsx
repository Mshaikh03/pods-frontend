import { useState } from "react";
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Trending",
  "News",
  "True Crime", 
  "Comedy",
  "Technology",
  "Business",
  "Health & Fitness",
  "Arts",
  "Education",
  "Society & Culture",
  "History"
];

export function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <nav className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-4 min-w-max">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="whitespace-nowrap transition-smooth hover:scale-105"
          >
            {category}
          </Button>
        ))}
      </div>
    </nav>
  );
}