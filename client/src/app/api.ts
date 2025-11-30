export function get(route: string) {
  return fetch(urlOf(route));
}

export function post(route: string, body?: any, token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Se houver token, adiciona o Authorization
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(urlOf(route), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function urlOf(route: string) {
  const connector = route.startsWith("/") ? "" : "/";
  return process.env.NEXT_PUBLIC_API_URL + connector + route;
}
