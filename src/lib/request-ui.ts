// Keep the server and client on one cookie contract, like a shared middleware option.
export const REQUESTS_COOKIE = "fleet_requests_state";
// Match the existing left sidebar's seven-day persistence window.
export const SIDEBAR_COOKIE_AGE = 60 * 60 * 24 * 7;
// Expanded is deliberately a UI placeholder until the requests table is built.
export type RequestsState = "collapsed" | "pinned" | "expanded";
// Treat malformed or obsolete cookies as collapsed instead of reserving unexpected space.
export function readRequestsState(value?: string): RequestsState {
  return value === "pinned" || value === "expanded" ? value : "collapsed";
}
