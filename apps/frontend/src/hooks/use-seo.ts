"use client";

import { useEffect } from "react";

/**
 * SEO metadata interface
 */
interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile" | "book" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterSite?: string;
  twitterCreator?: string;
  facebookAppId?: string;
  canonicalUrl?: string;
  robots?: string;
  viewport?: string;
}

/**
 * Hook for managing SEO metadata
 * Updates document head with SEO-friendly meta tags
 */
export function useSEO(metadata: SEOMetadata) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Update document title
    if (metadata.title) {
      document.title = metadata.title;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute("content", content);
    };

    // Basic meta tags
    if (metadata.description) {
      updateMetaTag("description", metadata.description);
    }

    if (metadata.keywords && metadata.keywords.length > 0) {
      updateMetaTag("keywords", metadata.keywords.join(", "));
    }

    if (metadata.author) {
      updateMetaTag("author", metadata.author);
    }

    if (metadata.robots) {
      updateMetaTag("robots", metadata.robots);
    }

    if (metadata.viewport) {
      updateMetaTag("viewport", metadata.viewport);
    }

    // Open Graph tags
    if (metadata.title) {
      updateMetaTag("og:title", metadata.title, true);
    }

    if (metadata.description) {
      updateMetaTag("og:description", metadata.description, true);
    }

    if (metadata.image) {
      updateMetaTag("og:image", metadata.image, true);
    }

    if (metadata.url) {
      updateMetaTag("og:url", metadata.url, true);
    }

    if (metadata.type) {
      updateMetaTag("og:type", metadata.type, true);
    }

    if (metadata.siteName) {
      updateMetaTag("og:site_name", metadata.siteName, true);
    }

    if (metadata.locale) {
      updateMetaTag("og:locale", metadata.locale, true);
    }

    if (metadata.author) {
      updateMetaTag("og:article:author", metadata.author, true);
    }

    if (metadata.publishedTime) {
      updateMetaTag("og:article:published_time", metadata.publishedTime, true);
    }

    if (metadata.modifiedTime) {
      updateMetaTag("og:article:modified_time", metadata.modifiedTime, true);
    }

    if (metadata.section) {
      updateMetaTag("og:article:section", metadata.section, true);
    }

    if (metadata.tags && metadata.tags.length > 0) {
      metadata.tags.forEach(tag => {
        updateMetaTag("og:article:tag", tag, true);
      });
    }

    // Twitter Card tags
    if (metadata.twitterCard) {
      updateMetaTag("twitter:card", metadata.twitterCard);
    }

    if (metadata.twitterSite) {
      updateMetaTag("twitter:site", metadata.twitterSite);
    }

    if (metadata.twitterCreator) {
      updateMetaTag("twitter:creator", metadata.twitterCreator);
    }

    if (metadata.title) {
      updateMetaTag("twitter:title", metadata.title);
    }

    if (metadata.description) {
      updateMetaTag("twitter:description", metadata.description);
    }

    if (metadata.image) {
      updateMetaTag("twitter:image", metadata.image);
    }

    // Facebook App ID
    if (metadata.facebookAppId) {
      updateMetaTag("fb:app_id", metadata.facebookAppId);
    }

    // Canonical URL
    if (metadata.canonicalUrl) {
      let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
      
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      
      canonical.setAttribute("href", metadata.canonicalUrl);
    }

  }, [metadata]);
}

/**
 * Hook for structured data (JSON-LD)
 * Adds structured data to the page for better SEO
 */
export function useStructuredData(data: any) {
  useEffect(() => {
    if (typeof document === "undefined" || !data) return;

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [data]);
}

/**
 * Hook for page analytics
 * Tracks page views and user interactions
 */
export function usePageAnalytics(pageName: string, metadata?: Partial<SEOMetadata>) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Track page view
    if ((window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("config", "GA_MEASUREMENT_ID", {
        page_title: metadata?.title || pageName,
        page_location: window.location.href,
        custom_map: {
          page_name: pageName,
        },
      });
    }

    // Track custom event
    if ((window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "page_view", {
        page_name: pageName,
        page_title: metadata?.title || pageName,
        page_url: window.location.href,
      });
    }
  }, [pageName, metadata]);
}

/**
 * Hook for social sharing
 * Provides social sharing functionality
 */
export function useSocialSharing(metadata: SEOMetadata) {
  const shareUrl = metadata.url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = metadata.title || "";
  const shareDescription = metadata.description || "";
  const shareImage = metadata.image || "";

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToReddit = () => {
    const url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You might want to show a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return {
    shareUrl,
    shareTitle,
    shareDescription,
    shareImage,
    shareToTwitter,
    shareToFacebook,
    shareToLinkedIn,
    shareToReddit,
    copyToClipboard,
  };
}

/**
 * Hook for breadcrumb navigation
 * Generates structured breadcrumb data
 */
export function useBreadcrumbs(items: Array<{ label: string; href: string }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href,
    })),
  };

  useStructuredData(structuredData);

  return {
    items,
    structuredData,
  };
}
