"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  REQUESTS_COOKIE,
  SIDEBAR_COOKIE_AGE,
  type RequestsState,
} from "@/lib/request-ui";

interface IRequestProvider {
  initialState: RequestsState;
  children: ReactNode;
}

// This context contains UI state only; it never fetches or owns request data.
type RequestsContextValue = {
  state: RequestsState;
  setState: (state: RequestsState) => void;
  toggle: () => void;
};

const RequestsContext = createContext<RequestsContextValue | null>(null);

export function RequestsProvider({
  initialState,
  children,
}: Readonly<IRequestProvider>) {
  // The server cookie initializes React directly, avoiding a post-mount layout correction.
  const [state, setState] = useState(initialState);
  // Keep persistence separate from React's conventionally named state/setter pair.
  const setPersistedState = useCallback((next: RequestsState) => {
    setState(next);
    // Reuse the existing sidebar's path/max-age cookie pattern; no localStorage is used.
    document.cookie = `${REQUESTS_COOKIE}=${next}; path=/; max-age=${SIDEBAR_COOKIE_AGE}; SameSite=Lax`;
  }, []);
  const toggle = useCallback(
    () => setPersistedState(state === "collapsed" ? "pinned" : "collapsed"),
    [state, setPersistedState],
  );
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Alt+Shift+Q is separate from the left sidebar's Ctrl/Cmd+B and browser refresh keys.
      // Never consume typing, composition, held keys, or shortcuts inside editable controls.
      const target = event.target as HTMLElement;
      if (
        event.repeat ||
        event.isComposing ||
        target.closest("input, textarea, select, [contenteditable='true']")
      )
        return;
      if (
        event.altKey &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.code === "KeyQ"
      ) {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);
  const value = useMemo(
    () => ({ state, setState: setPersistedState, toggle }),
    [state, setPersistedState, toggle],
  );
  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequestsUI() {
  const value = useContext(RequestsContext);
  if (!value) throw new Error("Requests UI must be inside RequestsProvider");
  return value;
}
