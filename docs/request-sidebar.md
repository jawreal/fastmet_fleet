# Global request sidebar

The sidebar is a UI preview in the fleet web app. The client app (`fastmet`) was
read as a reference for request fields; it was not changed. No API, stream,
database, fulfillment matching, or offer submission is connected.

## Structure

- `src/app/(dashboard)/layout.tsx` reads both sidebar cookies before rendering.
  The route group preserves the existing `/operations`, `/fleet`, and `/business`
  URLs and keeps the shell mounted across navigation. Authentication pages remain
  outside the dashboard shell.
- `DashboardShell` reuses the existing `SidebarProvider`, sidebar components,
  themed Sonner toaster, and Base UI sheet/popover primitives. There is no second
  sidebar library.
- `RequestsProvider` is React context for collapsed, pinned, and expanded UI state
  only. Think of its placement like Express middleware around a route group:
  each page inherits the same surrounding state instead of creating another copy.
- `RequestsSidebar` receives summaries, a separate count, and action callbacks.
  Cards never calculate the authoritative badge count from their visible length.
- `src/lib/requestFixtures.ts` is the sole mock-data source and exports the
  `RequestSummary` integration seam. Vehicle, route, pickup, fare and distance
  meanings follow the client's booking/request UI. Rail codes and request expiry
  are preview fields; client reschedule-confirmation expiry is not request expiry.
- Make offer is a no-op callback. View all switches to an empty expanded
  placeholder; the table, filters, pagination and offer composer come later.

## Layout and persistence

Desktop uses a three-column grid: existing navigation, page content, requests.
The request widths are 56px collapsed, 340px pinned, and 65% expanded. Header
heights share the existing `--header-height` token. Colors use existing theme
tokens, so dark and light themes both work.

Below 1280px the grid reserves only 56px for requests; pinned/expanded content
opens in the existing modal sheet with a scrim. The left navigation temporarily
uses icons without overwriting its saved desktop preference. Below 768px the
request sheet occupies the viewport and the existing left mobile navigation
remains available through its top-bar button.

`fleet_requests_state` stores `collapsed`, `pinned`, or `expanded` for seven days,
using the existing sidebar's cookie pattern. `sidebar_state` remains the left
sidebar cookie. No layout preference is stored in localStorage. Invalid request
cookie values fall back to collapsed. A server Suspense boundary waits for the
cookies instead of showing a shell at a guessed width.

**Shortcut: Alt+Shift+Q** toggles requests. It ignores editable fields, composition,
and held-key repeats. Escape closes an overlay sheet; desktop remains a normal
aside so users can still reach the page. Focus enters the panel on opening and
returns to the rail trigger on closing. Open/Offers sent tabs support arrow keys,
Home and End. Time-left copy always accompanies the urgency ring. Server rings
are neutral; the clock begins after mount. Reduced motion removes width/pulse
and sheet/flyout motion.

## Preview and manual verification

Run `pnpm dev:custom`, then open `http://localhost:4001/operations/overview` with:

| Query           | Expected rail                        |
| --------------- | ------------------------------------ |
| `?requests=0`   | Dimmed inbox; no tiles or badge      |
| `?requests=2`   | Two vehicle tiles; no overflow badge |
| `?requests=7`   | Three vehicle tiles and `+4`         |
| `?requests=120` | Three vehicle tiles and `99+`        |

Changing the URL and loading it selects a fixture. The query override and `+ New`
simulation button are development-only; production ignores the query and shows
the default seven-request preview. Fixtures reset on refresh. UI layout state
persists through the cookie. Navigating with the same fixture preserves a
simulated arrival rather than resetting it.

1. At 1440, 1280, 1024 and 390px, try collapsed, pinned and expanded, with each
   fixture and both saved left-nav states. Check that the page never scrolls
   horizontally and the headers align.
2. Refresh each state. Check the first rendered width, before client
   hydration: desktop reserves 56/340/65%; narrow screens always reserve 56px.
3. Tab to a vehicle tile. Its flyout should open; Tab reaches Make offer and Escape
   closes the flyout. Hover should also open it, and moving into it should keep it
   open. No customer identity or rejection action appears in the sidebar.
4. Use Alt+Shift+Q, then visit Open and Offers sent with arrow keys. View all opens
   the empty workspace. Collapse returns keyboard focus to the rail button.
5. Below 1280px, check the scrim, trapped focus, Escape and focus return. Below
   768px, check the sheet covers the full screen. Resize an open panel across the
   desktop breakpoint.
6. Use `+ New` while collapsed/pinned/expanded. A count pulse and one silent toast
   appear; the state and columns do not change. Repeat quickly: the toast replaces
   itself. Enable reduced motion and check the pulse/width motion stops.
7. During navigation from Overview to Trucks, trigger `+ New`, then navigate to
   Reports and back to Overview. The incremented count and selected layout state
   should survive all three route groups.
8. Run `pnpm build` and serve production. Verify `?requests=120` has no effect and
   neither the rail nor the panel exposes a simulation button.

## Remaining integration

Connect a real summary/count source through props, define vehicle-code mapping
and request-expiry semantics with the backend, and supply action callbacks for
the offer composer. Build the expanded table in the next phase. The ring currently
uses a one-hour visual scale for fixtures; it does not define the business TTL.

## Verification completed

Browser verification covered 96 combinations of four viewport widths, four
fixture counts, three request states, and both saved left-navigation states.
Additional checks covered keyboard entry/exit of flyouts, tab arrow navigation,
overlay Escape/focus return, an arrival during navigation across three route
groups, and unchanged geometry after arrivals in all 12 viewport/state pairs.
Server HTML was checked for all three cookie values and neutral clock labels.
Production was checked to ignore `?requests=120` and omit simulation controls.
Screenshots were captured for all 12 viewport/state pairs plus the flyout.

Formatting, TypeScript, and the production build passed. Lint completed with
existing warnings in unrelated components; the request-sidebar files add none.
