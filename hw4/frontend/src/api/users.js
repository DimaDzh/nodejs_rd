const baseUrl = import.meta.env.DEV
  ? "http://localhost:3000"
  : window.location.origin;

export async function fetchUsers() {
  const url = new URL("/api/brews", baseUrl);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch users failed: ${res.status}`);
  return res.json(); // -> array
}

/**
 * POST /api/users – створює нового користувача
 * @param {{ name: string, email: string }} body
 * @return {Promise<{ id:number, name:string, email:string }>}
 */

export async function createUser(body) {
  const url = new URL("/api/brews", baseUrl);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const { errors } = await res.json().catch(() => ({}));
    throw new Error(
      errors ? JSON.stringify(errors) : `Create failed: ${res.status}`
    );
  }
  return res.json(); // -> created user
}
