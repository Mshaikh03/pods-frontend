// Robust fetch with timeout and abort support
export async function fetchWithTimeout(
  url: string,
  opts: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 10000, signal, ...fetchOpts } = opts;
  const controller = new AbortController();

  // Propagate external aborts
  const abortHandler = () => controller.abort();
  signal?.addEventListener("abort", abortHandler);

  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...fetchOpts, // ✅ Preserve method, headers, body
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(fetchOpts.headers || {}), // ✅ Merge custom headers
      },
    });

    return res;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortHandler);
  }
}