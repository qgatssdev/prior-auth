"use client";

import { useEffect, useRef } from "react";

// An invisible marker under the list: when it scrolls into view, load the next page.
export function InfiniteScrollTrigger({
  loading,
  onVisible,
}: {
  loading: boolean;
  onVisible: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marker = ref.current;
    if (!marker) return;
    // rootMargin: start fetching 200px before the end, so the next page is usually ready in time.
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && onVisible(),
      { rootMargin: "200px" },
    );
    observer.observe(marker);
    return () => observer.disconnect();
    // Re-observing after each page loads also covers short pages: if the marker is
    // still on screen, the next page loads until the screen is full.
  }, [onVisible]);

  return (
    <div ref={ref} className="flex h-10 items-center justify-center text-sm text-muted-foreground">
      {loading && "Loading more…"}
    </div>
  );
}
