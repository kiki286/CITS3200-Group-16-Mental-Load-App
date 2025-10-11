export const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
if (!API_BASE) {
  throw new Error("EXPO_PUBLIC_BACKEND_URL is missing. Set it in .env before building.");
}

// Log once in web builds so you can see what got baked in
if (typeof window !== "undefined") console.log("[API_BASE]", API_BASE);

export async function fetchWithAuth(path, { method = "GET", headers = {}, body } = {}) {
  const { getAuth } = await import("firebase/auth");
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not signed in");
  const idToken = await user.getIdToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${idToken}`,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}