import { Headphones } from "lucide-react";

// --- Component Imports ---
import { Header } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import { CategoryNav } from "@/components/CategoryNav";
import PodcastCard from "@/components/PodcastCard";

// --- Mock podcast images ---
import podcast1 from "@/assets/podcast1.jpg";
import podcast2 from "@/assets/podcast2.jpg";
import podcast3 from "@/assets/podcast3.jpg";
import podcast4 from "@/assets/podcast4.jpg";
import podcast5 from "@/assets/podcast5.jpg";
import podcast6 from "@/assets/podcast6.jpg";

// --- Mock podcast data ---
const mockPodcasts = [
  {
    id: 1,
    title: "Dark Mysteries Unveiled",
    creator: "Sarah Chen",
    description:
      "Dive deep into unsolved mysteries and true crime cases that will keep you on the edge of your seat.",
    image: podcast1,
    duration: "45 min",
    category: "True Crime",
  },
  {
    id: 2,
    title: "Tech Talk Daily",
    creator: "Mike Rodriguez",
    description:
      "Your daily dose of technology news, startup insights, and innovation stories from Silicon Valley.",
    image: podcast2,
    duration: "32 min",
    category: "Technology",
  },
  {
    id: 3,
    title: "Comedy Gold Hour",
    creator: "The Laugh Squad",
    description:
      "Hilarious conversations, sketches, and interviews with the funniest people in entertainment.",
    image: podcast3,
    duration: "58 min",
    category: "Comedy",
  },
  {
    id: 4,
    title: "Business Builders",
    creator: "Emma Johnson",
    description:
      "Entrepreneurship stories, growth strategies, and insights from top startup founders.",
    image: podcast4,
    duration: "41 min",
    category: "Business",
  },
  {
    id: 5,
    title: "Wellness Warriors",
    creator: "Dr. Alex Kim",
    description:
      "Transform your health with expert advice on fitness, nutrition, and mental wellness.",
    image: podcast5,
    duration: "36 min",
    category: "Health & Fitness",
  },
  {
    id: 6,
    title: "History Uncovered",
    creator: "Prof. David Martinez",
    description:
      "Explore fascinating events, forgotten stories, and the people who shaped our world.",
    image: podcast6,
    duration: "52 min",
    category: "History",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <Header />

      <main className="space-y-16">

        {/* Hero Section */}
        <section className="w-full px-6 pt-16">
          <HeroSection />
        </section>

        {/* Search + Categories */}
        <section className="w-full px-6 space-y-8">
          <SearchBar />
          <CategoryNav />
        </section>

        {/* Podcast Grid */}
        <section className="w-full px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                Discover Podcasts
              </h2>
              <p className="text-neutral-400 mt-2">
                Explore our curated collection from top creators.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockPodcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-neutral-950/80 backdrop-blur-sm mt-20">
        <div className="w-full px-6 py-12 text-center space-y-5">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              Pods
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500">
                …
              </span>
            </span>
          </div>

          <p className="text-neutral-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Pods is your all-in-one platform for discovering, listening, and creating podcasts, unified in one sleek experience.
          </p>

          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Pods. All rights (and lefts) reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;