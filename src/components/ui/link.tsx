"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function prefetchImages(href: string) {
  if (!href.startsWith("/") || href.startsWith("/order") || href === "/") {
    return [];
  }
  const url = new URL(href, window.location.href);
  const imageResponse = await fetch(`/api/prefetch-images${url.pathname}`, {
    priority: "low",
  });
  // only throw in dev
  if (!imageResponse.ok && process.env.NODE_ENV === "development") {
    throw new Error("Failed to prefetch images");
  }
  const { images } = await imageResponse.json();
  return images as PrefetchImage[];
}

async function prefetchWithCredentials(href: string) {
  if (!href.startsWith("/")) return;

  try {
    const url = new URL(href, window.location.href);
    await fetch(url.pathname, {
      method: "GET",
      credentials: "include",
      headers: {
        "X-Prefetch": "1",
      },
    });
  } catch {
    // Prefetch failures are fine - it's just an optimization
  }
}

// Protected paths that require authentication
// These use prefetchWithCredentials() + router.prefetch() for proper auth handling
// Public paths use only router.prefetch() for instant RSC navigation
const protectedPaths = ["/admin", "/dashboard"];

function isProtectedPath(href: string) {
  const pathname = href.split("?")[0]; // Remove query string
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

const seen = new Set<string>();
const imageCache = new Map<string, PrefetchImage[]>();
const routePrefetchCache = new Set<string>();

export const Link: typeof NextLink = (({ children, ...props }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  let prefetchTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (props.prefetch === false) return;

    const linkElement = linkRef.current;
    if (!linkElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          prefetchTimeout = setTimeout(async () => {
            const href = String(props.href);
            
            // Prefetch route if not already done
            if (!routePrefetchCache.has(href)) {
              routePrefetchCache.add(href);
              
              if (isProtectedPath(href)) {
                // For protected routes: First warm up with authenticated fetch (sends cookies + X-Prefetch header)
                // Then use router.prefetch() to cache the RSC payload for instant navigation
                await prefetchWithCredentials(href);
                router.prefetch(href);
              } else {
                // Public routes: Just use Next.js prefetch (no auth needed)
                router.prefetch(href);
              }
              await sleep(0);
            }

            if (!imageCache.has(href)) {
              void prefetchImages(href).then((images) => {
                imageCache.set(href, images);
              }, console.error);
            }

            observer.unobserve(entry.target);
          }, 300);
        } else if (prefetchTimeout) {
          clearTimeout(prefetchTimeout);
          prefetchTimeout = null;
        }
      },
      { rootMargin: "0px", threshold: 0.1 },
    );

    observer.observe(linkElement);

    return () => {
      observer.disconnect();
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
    };
  }, [props.href, props.prefetch]);

  return (
    <NextLink
      ref={linkRef}
      prefetch={false}
      onMouseEnter={() => {
        const href = String(props.href);
        
        // Skip route prefetch if already done
        if (!routePrefetchCache.has(href)) {
          routePrefetchCache.add(href);
          
          if (isProtectedPath(href)) {
            prefetchWithCredentials(href).then(() => {
              router.prefetch(href);
            });
          } else {
            router.prefetch(href);
          }
        }
        
        const cachedImages = imageCache.get(href);
        
        if (cachedImages && cachedImages.length > 0) {
          // Use cached images if available
          for (const image of cachedImages) {
            prefetchImage(image);
          }
        } else {
          // Fetch images if not cached yet (e.g., on hover before intersection)
          void prefetchImages(href).then((images) => {
            imageCache.set(href, images);
            for (const image of images) {
              prefetchImage(image);
            }
          }).catch((error) => {
            // Silently handle errors - prefetch failures shouldn't break the UI
            if (process.env.NODE_ENV === 'development') {
              console.warn('Image prefetch error on hover for', href, error);
            }
          });
        }
      }}
      onMouseDown={(e) => {
        const url = new URL(String(props.href), window.location.href);
        if (
          url.origin === window.location.origin &&
          e.button === 0 &&
          !e.altKey &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          e.preventDefault();
          router.push(String(props.href));
        }
      }}
      {...props}
    >
      {children}
    </NextLink>
  );
}) as typeof NextLink;

function prefetchImage(image: PrefetchImage) {
  if (image.loading === "lazy" || seen.has(image.srcset)) {
    return;
  }
  const img = new Image();
  img.decoding = "async";
  if ('fetchPriority' in img) {
    (img as HTMLImageElement & { fetchPriority: string }).fetchPriority = "low";
  }
  img.sizes = image.sizes;
  seen.add(image.srcset);
  img.srcset = image.srcset;
  img.src = image.src;
  img.alt = image.alt;
}
