"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import Script from "next/script";
import { useTheme } from "next-themes";
import { turnstileLoginAction } from "@/lib/auth/login";
import { AuthAlert } from "./AuthAlert";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      appearance: "interaction-only";
      theme: "light" | "dark";
      size: "compact" | "flexible";
      "response-field": false;
      callback: (token: string) => void;
      "error-callback": () => boolean;
      "expired-callback": () => void;
      "timeout-callback": () => void;
      "unsupported-callback": () => void;
    },
  ): string | undefined;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileWidgetHandle {
  reset(): void;
}

interface TurnstileWidgetProps {
  onTokenChange: (token: string | null) => void;
  ref?: Ref<TurnstileWidgetHandle>;
}

const siteKey = process.env.NEXT_PUBLIC_FLEET_TURNSTILE_SITE_KEY?.trim();
const loadError =
  "Security verification could not load. Reload the page and try again.";

export function TurnstileWidget({
  onTokenChange,
  ref,
}: Readonly<TurnstileWidgetProps>) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const [ready, setReady] = useState(false);
  const [compact, setCompact] = useState<boolean | null>(null);
  const [problem, setProblem] = useState("");

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        onTokenChange(null);
        setProblem("");
        try {
          if (widgetId.current) window.turnstile?.reset(widgetId.current);
        } catch {
          setProblem(loadError);
        }
      },
    }),
    [onTokenChange],
  );

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setCompact(entry.contentRect.width < 300),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || compact === null || !siteKey || !container.current) return;
    const api = window.turnstile;
    if (!api) return;

    let active = true;
    const update = (token: string | null, message = "") => {
      if (!active) return;
      onTokenChange(token);
      setProblem(message);
    };
    update(null);
    let id: string | undefined;
    try {
      id = api.render(container.current, {
        sitekey: siteKey,
        action: turnstileLoginAction,
        appearance: "interaction-only",
        theme,
        size: compact ? "compact" : "flexible",
        "response-field": false,
        callback: (token) => update(token),
        "error-callback": () => {
          update(
            null,
            "Security verification failed to load. Wait for it to retry or reload the page.",
          );
          return true;
        },
        "expired-callback": () => update(null),
        "timeout-callback": () =>
          update(
            null,
            "Security verification timed out. Complete the refreshed challenge.",
          ),
        "unsupported-callback": () =>
          update(
            null,
            "This browser could not run security verification. Try a supported browser.",
          ),
      });
      widgetId.current = id;
      if (!id) update(null, loadError);
    } catch {
      update(null, loadError);
    }

    return () => {
      active = false;
      widgetId.current = undefined;
      if (id) api.remove(id);
    };
  }, [compact, onTokenChange, ready, theme]);

  if (!siteKey)
    return (
      <AuthAlert>Security verification is temporarily unavailable.</AuthAlert>
    );

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => {
          if (window.turnstile) setReady(true);
          else setProblem(loadError);
        }}
        onError={() => {
          onTokenChange(null);
          setProblem(loadError);
        }}
      />
      <div ref={container} className="w-full [&_iframe]:max-w-full" />
      {problem && (
        <div className="mb-2">
          <AuthAlert>{problem}</AuthAlert>
        </div>
      )}
    </>
  );
}
