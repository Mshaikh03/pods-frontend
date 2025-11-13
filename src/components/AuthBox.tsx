import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthBox() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // --- Spotify Login ---
const signInWithSpotify = async () => {
  try {
    console.log("🔑 Starting Spotify login flow...");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        scopes: "user-read-email",
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error("Spotify login failed:", error.message);
    else console.log("✅ Supabase OAuth response:", data);
  } catch (err) {
    console.error("Unexpected login error:", err);
  }
};

  // --- Sign Out ---
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  // --- Auth State Sync ---
useEffect(() => {
  const init = async () => {
    // ✅ Always get the current session, not just user
    const { data } = await supabase.auth.getSession();
    if (data?.session) setUser(data.session.user);

    // ✅ Listen for future auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  };
  init();
}, []);

  // --- UI ---
  if (user) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <h3>👋 Welcome, {user.user_metadata?.name || user.email}</h3>
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt="Spotify avatar"
            width={64}
            height={64}
            style={{ borderRadius: "50%", marginTop: 8 }}
          />
        )}
        <br />
        <button
          onClick={signOut}
          style={{
            marginTop: 12,
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "#1DB954",
            color: "white",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <button
        onClick={signInWithSpotify}
        disabled={loading}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          background: "#1DB954",
          color: "white",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Connecting..." : "Sign in with Spotify"}
      </button>
    </div>
  );
}