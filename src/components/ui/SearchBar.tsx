import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit }) => {
  return (
    <div className="flex">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="Search podcasts..."
        className="flex-1 p-3 rounded-l-lg text-black outline-none"
      />
      <button
        onClick={onSubmit}
        className="bg-blue-600 px-5 rounded-r-lg hover:bg-blue-700"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
