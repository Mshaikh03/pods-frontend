import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Provider } from "@supabase/auth-js";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSignIn = async (provider?: Provider) => {
    if (provider) {
      await supabase.auth.signInWithOAuth({ provider });
    } else {
      const email = prompt("Email");
      const password = prompt("Password");
      if (!email || !password) return;
      await supabase.auth.signInWithPassword({ email, password });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user)
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl mb-4">Sign In</h2>
        <button
          onClick={() => handleSignIn()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Email Login
        </button>
        <button
          onClick={() => handleSignIn("spotify")}
          className="ml-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          Login with Spotify
        </button>
      </div>
    );

  return (
    <div className="p-6">
      <h2 className="text-xl">Welcome, {user.email}</h2>
      <p className="mt-2">Account ID: {user.id}</p>
      <button
        onClick={handleSignOut}
        className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}