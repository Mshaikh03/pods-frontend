// src/components/SearchBar.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

 const triggerSearch = () => {
  const q = searchQuery.trim();
  onSearch?.(q);
};
  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) onSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch();
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Search Icon */}
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 z-10" />

      {/* Input Field */}
      <Input
        type="text"
        placeholder="Search podcasts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-14 pr-12 h-14 bg-neutral-900/40 backdrop-blur-sm border border-neutral-800
                   text-lg text-white rounded-2xl placeholder:text-neutral-500
                   transition-all duration-300 hover:bg-neutral-900/60
                   focus-visible:ring-2 focus-visible:ring-fuchsia-500
                   focus-visible:border-fuchsia-500 focus-visible:shadow-lg
                   focus-visible:shadow-fuchsia-500/20"
      />

      {/* Clear Button */}
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 text-neutral-400 hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;