// src/App.tsx
import React, { useEffect, useState } from "react";
import { Headphones, Compass, Mic } from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import CategoryRow from "@/components/ui/CategoryRow";
import SearchBar from "@/components/SearchBar";
import DiscoverBox from "@/pages/DiscoverBox";
import Create from "@/pages/Create";
import Account from "@/pages/Account";
import UploadForm from "@/components/ui/UploadForm";
import { PodcastCacheProvider } from "@/context/PodcastCacheContext";

// Types
interface Podcast {
  id: string | number;
  title: string;
  author?: string;
  image?: string;
  link?: string;
  url?: string;
  description?: string;
}

// API base
const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:4000";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

// Home page
const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<Record<string, Podcast[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load home feed once
  useEffect(() => {
    const loadHomeFeed = async () => {
      try {
        const res = await fetch(`${API_BASE}/podcasts/home`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setHomeData(data);
      } catch (err) {
        console.error("Failed to load home feed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeFeed();
  }, []);

  // Backend endpoints
const endpoints = {
  search: (q: string) => `${API_BASE}/search/${encodeURIComponent(q)}`,
  trending: `${API_BASE}/trending`,
  sports: `${API_BASE}/search/sports`,
  news: `${API_BASE}/search/news`,
  truecrime: `${API_BASE}/search/truecrime`,
  technology: `${API_BASE}/search/technology`,
  lifestyle: `${API_BASE}/search/lifestyle`,
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="relative w-full max-w-3xl rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-xl shadow-2xl p-8 sm:p-10">

          <NavLink
            to="/"
            className="flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
          >
            <Headphones className="h-10 w-10 text-fuchsia-500" />
            <h1 className="text-5xl font-semibold tracking-tight cursor-pointer">
              Pods
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500">
                …
              </span>
            </h1>
          </NavLink>

          <p className="text-neutral-400 text-lg max-w-md mx-auto mt-5">
            The world’s first all-in-one podcast platform
            for you to Discover, Listen, and Create.
          </p>

          <div className="w-full mt-6 flex justify-center">
            <div className="w-full max-w-xl">
              <SearchBar onSearch={setSearchQuery} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            {[
              { to: "/discover", label: "Discover", icon: Compass },
              { to: "/", label: "Listen", icon: Headphones },
              { to: "/create", label: "Create", icon: Mic },
            ].map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg"
                      : "bg-neutral-800/60 text-neutral-300 hover:text-white hover:bg-neutral-700/60"
                  }`
                }
              >
                <Icon className="h-5 w-5" /> {label}
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="w-full px-4 md:px-6 lg:px-10 pb-16 space-y-12">
        {/* Show search results when searching */}
        {searchQuery ? (
          <CategoryRow
            title={`Search Results for "${searchQuery}"`}
            endpoint={endpoints.search(searchQuery)}
          />
        ) : loading ? (
          <p className="text-center text-neutral-500">Loading podcasts...</p>
        ) : (
          <>
            {/* Category selector */}
<div className="flex flex-wrap justify-center gap-3 mb-8">

  {/* HOME OPTION */}
  <button
    onClick={() => {
      setSelectedCategory("Home");
      setSearchQuery(""); // reset search
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
    className={
      "px-4 py-2 text-sm font-medium rounded-full border transition-colors " +
      (selectedCategory === "Home"
        ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-fuchsia-700 shadow"
        : "border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700")
    }
  >
    Home
  </button>

  {[
    "Business",
    "Health",
    "Comedy",
    "History",
    "Science",
    "Finance",
    "Self-Improvement",
    "Lifestyle",
  ].map((category) => {
    const isActive = selectedCategory === category;

    return (
      <button
        key={category}
        onClick={() => {
          setSelectedCategory(category);
          setSearchQuery(category);
        }}
        className={
          "px-4 py-2 text-sm font-medium rounded-full border transition-colors " +
          (isActive
            ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-fuchsia-700 shadow"
            : "border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700")
        }
      >
        {category}
      </button>
    );
  })}
</div>
            {/* Default rows */}
            <CategoryRow title="Trending" endpoint={endpoints.trending} />
            <CategoryRow title="Sports" endpoint={endpoints.sports} />
            <CategoryRow title="News" endpoint={endpoints.news} />
            <CategoryRow title="True Crime" endpoint={endpoints.truecrime} />
            <CategoryRow title="Technology" endpoint={endpoints.technology} />
            <CategoryRow title="Lifestyle" endpoint={endpoints.lifestyle} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-white/40 text-sm">
            Pods — Connected to {API_BASE}
          </p>
        </div>
      </footer>
    </div>
  );
};

// App router
export default function App() {
  return (
    <PodcastCacheProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<DiscoverBox />} />
          <Route path="/create" element={<Create />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Router>
    </PodcastCacheProvider>
  );
}