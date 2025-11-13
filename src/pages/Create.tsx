import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Headphones,
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  Compass,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import CategoryRow from "@/components/ui/CategoryRow";

const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:4000";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

// ---- unified endpoints (match Home) ----
const endpoints = {
  search: (q: string) => `${API_BASE}/search/${encodeURIComponent(q)}`,
};
const UPLOAD_URL = `${API_BASE}/upload`; // change to `${API_BASE}/api/upload` if your server expects that

type RecorderState = "idle" | "recording" | "stopped";

const Create: React.FC = () => {
  // episode meta
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");

  // status
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // learn row
  const [showLearnRow, setShowLearnRow] = useState(false);

  // recording
  const [recState, setRecState] = useState<RecorderState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // pick the best supported audio MIME
  const pickMime = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
      "audio/webm",
      "audio/mp4", // safari-ish fallback
    ];
    for (const t of candidates) {
      // @ts-ignore
      if (window.MediaRecorder && MediaRecorder.isTypeSupported?.(t)) return t;
    }
    return ""; // let browser choose
  };

  // --- Recording logic ---
  const startRecording = async () => {
    setMessage(null);
    try {
      // user gesture required; request mic
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      const mimeType = pickMime();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const type = mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // cleanup input stream
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setRecState("stopped");
        setMessage("Recording captured. You can preview before publishing.");
      };

      mr.start();
      setRecState("recording");
      setMessage("Recording… Speak into your microphone.");
    } catch (err: any) {
      console.error(err);
      const hint =
        location.protocol !== "https:"
          ? " Tip: browsers often block mic on http. Run over https (ngrok, local https, or deployed domain)."
          : "";
      setMessage(
        `Microphone access failed: ${err?.message || err}. Check site permissions.${hint}`
      );
      setRecState("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recState === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // --- Playback wiring ---
  useEffect(() => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // accept any audio; preview it
    setAudioBlob(f);
    setAudioUrl(URL.createObjectURL(f));
    setMessage("File selected. Ready to publish.");
  };

  // --- Upload to backend (server will store to Supabase/DB) ---
  const handleUpload = async () => {
    if (!audioBlob) {
      setMessage("Please record or upload audio before publishing.");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      // generate a safe filename
      const base = (title || "episode").toLowerCase().replace(/[^a-z0-9-_]+/g, "-");
      const ext =
        (audioBlob.type.includes("webm") && "webm") ||
        (audioBlob.type.includes("ogg") && "ogg") ||
        (audioBlob.type.includes("mp4") && "m4a") ||
        "webm";
      const fileName = `${base}-${Date.now()}.${ext}`;

      const file = new File([audioBlob], fileName, { type: audioBlob.type || "audio/webm" });

      const form = new FormData();
      form.append("audio", file);
      form.append("title", title || "Untitled Episode");
      form.append("author", author || "Guest Creator");
      form.append("description", description || "");

      const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Upload failed (HTTP ${res.status})`);

      setMessage("Upload successful! Your episode is live.");
      setTitle("");
      setAuthor("");
      setDescription("");
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setRecState("idle");
    } catch (err: any) {
      setMessage(`Upload failed: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // safety: revoke blob url on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center px-6 py-12">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center w-full mb-10">
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

          <p className="text-neutral-400 text-lg max-w-md mx-auto mt-4">
            Record or upload your podcast episode and share it with the world.
          </p>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <NavLink
              to="/discover"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-medium bg-neutral-800/60 text-neutral-300 hover:text-white hover:bg-neutral-700/60"
            >
              <Compass className="h-5 w-5" /> Discover
            </NavLink>
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-medium bg-neutral-800/60 text-neutral-300 hover:text-white hover:bg-neutral-700/60"
            >
              <Headphones className="h-5 w-5" /> Listen
            </NavLink>
            <NavLink
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl font-medium bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg"
            >
              <Mic className="h-5 w-5" /> Create
            </NavLink>
          </div>

          {/* Learn Button */}
          <div className="mt-8">
            <Button
              onClick={() => setShowLearnRow((v) => !v)}
              className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:opacity-90 text-white font-semibold px-6 py-2"
            >
              {showLearnRow ? "Hide Tutorials" : "Learn How to Podcast"}
            </Button>
          </div>
        </div>
      </section>

      {/* Learn row (uses the SAME search endpoint as Home) */}
      {showLearnRow && (
        <div className="w-full max-w-6xl mb-10">
          <CategoryRow
            title='Learn How to Podcast'
            endpoint={endpoints.search("learn how to podcast")}
            pageSize={10}
          />
        </div>
      )}

      {/* Main */}
      <div className="w-full max-w-3xl space-y-8">
        {/* Record */}
        <Card className="bg-neutral-900/70 border border-neutral-800 rounded-2xl">
          <CardHeader>
            <CardTitle>Record Audio</CardTitle>
            <CardDescription className="text-neutral-400">
              Start a fresh recording using your microphone.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            {recState !== "recording" ? (
              <Button onClick={startRecording} className="bg-fuchsia-600 hover:bg-fuchsia-700">
                <Mic className="mr-2 h-5 w-5" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700">
                <Square className="mr-2 h-5 w-5" /> Stop Recording
              </Button>
            )}
            {recState === "recording" && (
              <span className="text-red-400 animate-pulse">Recording…</span>
            )}
          </CardContent>
        </Card>

        {/* Upload */}
        <Card className="bg-neutral-900/70 border border-neutral-800 rounded-2xl">
          <CardHeader>
            <CardTitle>Upload Audio</CardTitle>
            <CardDescription className="text-neutral-400">
              Or upload an existing file (mp3, wav, m4a, webm, ogg).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="audio-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-neutral-700 rounded-xl p-8 text-center hover:border-neutral-500 transition">
                <Upload className="mx-auto h-10 w-10 text-neutral-400 mb-2" />
                <p className="text-neutral-400">Click to upload or drag & drop</p>
                <p className="text-sm text-neutral-500">Max 500MB</p>
              </div>
              <Input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </Label>
          </CardContent>
        </Card>

        {/* Preview */}
        {audioUrl && (
          <Card className="bg-neutral-900/70 border border-neutral-800 rounded-2xl">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button
                onClick={togglePlayback}
                variant="outline"
                className="border-neutral-700 text-white hover:bg-neutral-800"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Play
                  </>
                )}
              </Button>
              <audio ref={audioRef} src={audioUrl ?? undefined} className="hidden" />
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <Card className="bg-neutral-900/70 border border-neutral-800 rounded-2xl">
          <CardHeader>
            <CardTitle>Episode Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Episode title"
                className="mt-1 bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Creator name"
                className="mt-1 bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your episode"
                className="w-full min-h-[100px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder:text-neutral-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Publish */}
        <Button
          onClick={handleUpload}
          disabled={loading || !audioBlob || !title || !author}
          className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Publish Episode"}
        </Button>

        {message && (
          <p
            className={`text-center text-sm ${
              /successful/i.test(message)
                ? "text-green-400"
                : /failed|error/i.test(message)
                ? "text-red-400"
                : "text-neutral-300"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Create;