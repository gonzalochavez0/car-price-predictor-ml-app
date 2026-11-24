/**
 * Thin client for the FastAPI backend.
 *
 * The base URL is injected at build time from `PUBLIC_API_URL` (see `.env.example`),
 * so the same bundle can point at localhost, a Render service or a custom domain.
 */

const BASE_URL = (import.meta.env.PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "No se pudo conectar con la API. Verifica que el backend esté corriendo.",
      0,
    );
  }

  if (!response.ok) {
    let detail = `La API respondió con estado ${response.status}.`;
    try {
      const payload = await response.json();
      if (typeof payload.detail === "string") detail = payload.detail;
    } catch {
      /* the body was not JSON: keep the generic message */
    }
    throw new ApiError(detail, response.status);
  }

  return response.json();
}

export function fetchMetadata(signal) {
  return request("/metadata", { signal });
}

export function predictPrice(car, signal) {
  return request("/predict", { method: "POST", body: car, signal });
}
