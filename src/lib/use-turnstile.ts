"use client";

/* Cloudflare Turnstile for forms that need a token at submit time.
   Shared Motchi standard, see AGENTS.md.

   The widget runs invisibly ("interaction-only") and shows a checkbox in the
   container only when Cloudflare is unsure about the visitor. getToken()
   runs a fresh check for each submission because tokens are single-use.
   No cookies are set.
   Source: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/ */

import { useCallback, useEffect, useRef } from "react";

type TurnstileApi = {
    render: (container: HTMLElement, options: Record<string, unknown>) => string | undefined;
    execute: (widgetId: string) => void;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
};
declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const scriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    loading ??= new Promise<TurnstileApi>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.onload = () =>
            window.turnstile
                ? resolve(window.turnstile)
                : reject(new Error("Turnstile unavailable"));
        script.onerror = () => {
            loading = null;
            script.remove();
            reject(new Error("Turnstile unavailable"));
        };
        document.head.append(script);
    });
    return loading;
}

type Pending = { resolve: (token: string) => void; reject: (error: Error) => void };

/** Returns a ref for the widget container and getToken(). Put the container
    near the submit button: an interactive check appears there if needed. */
export function useTurnstile(siteKey: string | undefined, action = "contact") {
    const container = useRef<HTMLDivElement>(null);
    const widget = useRef<Promise<{ api: TurnstileApi; id: string }> | null>(null);
    const pending = useRef<Pending | null>(null);

    useEffect(() => {
        if (!siteKey) return;
        let cancelled = false;
        let id: string | undefined;
        widget.current = loadTurnstile().then((api) => {
            if (cancelled || !container.current) throw new Error("Turnstile unavailable");
            id = api.render(container.current, {
                sitekey: siteKey,
                action,
                execution: "execute",
                appearance: "interaction-only",
                size: "flexible",
                callback: (token: string) => {
                    pending.current?.resolve(token);
                    pending.current = null;
                },
                "error-callback": () => {
                    pending.current?.reject(new Error("Turnstile check failed"));
                    pending.current = null;
                },
                "expired-callback": () => undefined,
            });
            if (!id) throw new Error("Turnstile unavailable");
            return { api, id };
        });
        widget.current.catch(() => undefined);
        return () => {
            cancelled = true;
            if (id) window.turnstile?.remove(id);
            widget.current = null;
            pending.current?.reject(new Error("Turnstile removed"));
            pending.current = null;
        };
    }, [siteKey, action]);

    const getToken = useCallback(async (): Promise<string> => {
        if (!siteKey || !widget.current) throw new Error("Turnstile is not configured");
        const { api, id } = await widget.current;
        pending.current?.reject(new Error("Superseded"));
        return new Promise<string>((resolve, reject) => {
            pending.current = { resolve, reject };
            api.reset(id);
            api.execute(id);
        });
    }, [siteKey]);

    return { container, getToken };
}
