/**
 * useWordPressBridge.ts
 *
 * Drop this hook into your React calculator app. It handles:
 *   - Sending height changes to the parent WordPress iframe so it auto-resizes
 *   - Providing helper functions to scroll the parent page and send analytics events
 *
 * Usage in your React app:
 *
 *   import { useWordPressBridge } from './useWordPressBridge';
 *
 *   function App() {
 *     const { sendEvent, scrollToTop } = useWordPressBridge();
 *
 *     const handleEstimationComplete = (result) => {
 *       sendEvent('estimation_complete', {
 *         style: result.style,
 *         priceRange: result.priceRange,
 *       });
 *       scrollToTop();
 *     };
 *
 *     return <div>...</div>;
 *   }
 */

import { useEffect, useCallback, useRef } from 'react';

/** Check if we're running inside an iframe */
function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin restriction means we're in an iframe
  }
}

/** Safely post a message to the parent window */
function postToParent(data: Record<string, unknown>): void {
  if (!isInIframe()) return;
  try {
    // Use '*' for target origin — the WordPress bridge validates on its end.
    // This is safe because we only send non-sensitive UI data (heights, event names).
    window.parent.postMessage(data, '*');
  } catch {
    // Silently fail if parent is inaccessible
  }
}

export function useWordPressBridge() {
  const lastHeight = useRef(0);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  // ── Auto-resize: observe body height changes ──────────────
  useEffect(() => {
    if (!isInIframe()) return;

    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      // Only send if height actually changed (avoid message spam)
      if (Math.abs(height - lastHeight.current) > 5) {
        lastHeight.current = height;
        postToParent({ type: 'tc:resize', height });
      }
    };

    // Send initial height
    sendHeight();

    // Watch for DOM changes that affect height
    resizeObserver.current = new ResizeObserver(() => {
      sendHeight();
    });
    resizeObserver.current.observe(document.body);

    // Also catch images loading, fonts rendering, etc.
    window.addEventListener('load', sendHeight);

    // Periodic fallback for edge cases (animations, lazy content)
    const interval = setInterval(sendHeight, 1000);

    return () => {
      resizeObserver.current?.disconnect();
      window.removeEventListener('load', sendHeight);
      clearInterval(interval);
    };
  }, []);

  // ── Scroll parent page to top of iframe ───────────────────
  const scrollToTop = useCallback((offset = 20) => {
    postToParent({ type: 'tc:scroll', offset });
  }, []);

  // ── Send a named event to parent (analytics, completion) ──
  const sendEvent = useCallback((name: string, data?: Record<string, unknown>) => {
    postToParent({ type: 'tc:event', name, data });
  }, []);

  return {
    isEmbedded: isInIframe(),
    scrollToTop,
    sendEvent,
  };
}
