// Stable fetch stub so components that POST to the booking intake handler can
// be tested without a network connection. Any URL that isn't the booking
// intake handler fails loudly instead of being swallowed by a fake 200.
import type {} from "vitest";

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const bookingsOk = (): Promise<Response> =>
  Promise.resolve(
    new Response(JSON.stringify({ message: "booking-intake-ready" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

const defaultImpl: FetchLike = (input) => {
  const url = String(input);
  if (url.includes("/api/bookings") && url.startsWith("http")) {
    return bookingsOk();
  }
  return Promise.reject(new Error(`unexpected fetch in tests: ${url}`));
};

let fetchImpl: typeof fetch = defaultImpl as unknown as typeof fetch;

export function __setFetchImpl(impl: typeof fetch) {
  fetchImpl = impl;
}

export function __resetFetch() {
  fetchImpl = defaultImpl as unknown as typeof fetch;
}

if (!globalThis.fetch) {
  globalThis.fetch = ((...args: Parameters<typeof fetch>) =>
    fetchImpl(...args)) as unknown as typeof fetch;
} else {
  globalThis.fetch = ((...args: Parameters<typeof fetch>) =>
    fetchImpl(...args)) as unknown as typeof fetch;
}
