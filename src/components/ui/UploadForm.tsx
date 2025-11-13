import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:4000";

export default function UploadForm() {
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("title", title || file.name);
      formData.append("author", author || "Guest Creator");
      formData.append("description", description || "");

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setMessage("✅ Upload successful!");
      setTitle("");
      setAuthor("");
      setDescription("");
      setFile(null);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setMessage(`❌ Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-8 shadow-lg max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-white text-center">
        Upload Your Podcast
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="title" className="text-neutral-300">
            Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter podcast title"
            className="mt-1 bg-neutral-800 text-white border-neutral-700"
          />
        </div>

        <div>
          <Label htmlFor="author" className="text-neutral-300">
            Author
          </Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name"
            className="mt-1 bg-neutral-800 text-white border-neutral-700"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-neutral-300">
            Description (optional)
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description"
            className="mt-1 bg-neutral-800 text-white border-neutral-700"
          />
        </div>

        <div>
          <Label htmlFor="file" className="text-neutral-300">
            Choose File
          </Label>
          <Input
            id="file"
            type="file"
            accept="audio/*,video/mp4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 bg-neutral-800 text-white border-neutral-700"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold mt-3 hover:opacity-90 transition"
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm ${
            message.startsWith("✅") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
