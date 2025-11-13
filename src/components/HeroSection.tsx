import React from "react";

type Podcast = {
  id: string;
  title: string;
  image?: string;
  [key: string]: any;
};

const CategoryRow: React.FC<{ title: string; endpoint: string }> = ({ title, endpoint }) => {
  const [items, setItems] = React.useState<Podcast[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        // assume the endpoint returns an array; otherwise adapt as needed
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto">
        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-400">No items</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="min-w-[200px] bg-gray-800 p-4 rounded">
              <div className="font-medium">{item.title}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const HeroSection: React.FC = () => {
  const BASE_URL = "http://127.0.0.1:4000/podcasts";

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <h1 className="text-3xl font-extrabold mb-10 text-center">
        🎙️ Discover Podcasts
      </h1>

      <CategoryRow title="Trending" endpoint={`${BASE_URL}/trending`} />
      <CategoryRow title="Sports" endpoint={`${BASE_URL}/category/sports`} />
      <CategoryRow title="News" endpoint={`${BASE_URL}/category/news`} />
      <CategoryRow title="True Crime" endpoint={`${BASE_URL}/category/truecrime`} />
      <CategoryRow title="Comedy" endpoint={`${BASE_URL}/category/comedy`} />
      <CategoryRow title="Business" endpoint={`${BASE_URL}/category/business`} />
      <CategoryRow title="Technology" endpoint={`${BASE_URL}/category/technology`} />
    </div>
  );
};

export default HeroSection;