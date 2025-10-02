"use client";

import React, { useState } from "react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { 
  ErrorBoundary, 
  useErrorBoundary, 
  AccessibleButton, 
  AccessibleField, 
  ScreenReaderOnly,
  useFocusTrap,
  useAriaLiveRegion,
  useKeyboardNavigation,
  useSkipLinks
} from "@repo/ui/accessibility";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { useSEO } from "@/hooks/use-seo";
import { useSocialSharing } from "@/hooks/use-seo";

/**
 * Demo component that can throw errors for testing error boundaries
 */
function ErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("This is a test error for the error boundary!");
  }
  
  return (
    <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
      <p className="text-green-800">Component is working correctly!</p>
    </div>
  );
}

/**
 * Demo page for Phase 5: Production Polish
 * Showcases error boundaries, accessibility, performance monitoring, and SEO
 */
export default function DemoPhase5Page() {
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);
  const [focusTrapActive, setFocusTrapActive] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [navigationItems] = useState([
    { id: 1, name: "Home" },
    { id: 2, name: "About" },
    { id: 3, name: "Services" },
    { id: 4, name: "Contact" },
  ]);

  // Hooks for Phase 5 features
  const { captureError, resetError } = useErrorBoundary();
  const { announce, LiveRegion } = useAriaLiveRegion();
  const { SkipLinks } = useSkipLinks();
  const { metrics, trackCustomMetric, trackPageLoad, trackInteraction, trackError } = usePerformanceMonitoring({
    enabled: true,
    logToConsole: true,
  });

  // SEO metadata
  useSEO({
    title: "Phase 5 Demo - Production Polish Features",
    description: "Demonstrating error boundaries, accessibility, performance monitoring, and SEO optimization features.",
    keywords: ["demo", "production", "polish", "accessibility", "performance", "seo"],
    type: "website",
    siteName: "Comic Creator App",
    twitterCard: "summary_large_image",
  });

  // Social sharing
  const { shareToTwitter, shareToFacebook, shareToLinkedIn, copyToClipboard } = useSocialSharing({
    title: "Phase 5 Demo - Production Polish Features",
    description: "Check out these amazing production-ready features!",
    url: typeof window !== "undefined" ? window.location.href : "",
  });

  // Focus trap
  const focusTrapRef = useFocusTrap(focusTrapActive);

  // Keyboard navigation
  const { focusedIndex, handleKeyDown, focusItem, clearFocus } = useKeyboardNavigation(navigationItems, "horizontal");

  // Track page load
  React.useEffect(() => {
    trackPageLoad("phase5-demo");
  }, [trackPageLoad]);

  const handleThrowError = () => {
    setShouldThrowError(true);
    setErrorBoundaryKey(prev => prev + 1);
  };

  const handleResetError = () => {
    setShouldThrowError(false);
    setErrorBoundaryKey(prev => prev + 1);
  };

  const handleManualError = () => {
    try {
      throw new Error("Manual error for testing!");
    } catch (error) {
      captureError(error as Error);
    }
  };

  const handleAnnounce = () => {
    const message = `Announcement ${announcements.length + 1} - This is a test announcement for screen readers!`;
    announce(message);
    setAnnouncements(prev => [...prev, message]);
  };

  const handleTrackInteraction = (action: string, target: string) => {
    trackInteraction(action, target);
  };

  const handleTrackCustomMetric = () => {
    const value = Math.random() * 1000;
    trackCustomMetric("demo_metric", value, "ms");
  };

  const handleTrackError = () => {
    const error = new Error("Test error for monitoring");
    trackError(error, "demo-page");
  };

  const skipLinks = [
    { href: "#main-content", label: "Main Content" },
    { href: "#error-boundaries", label: "Error Boundaries" },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#performance", label: "Performance" },
    { href: "#seo", label: "SEO" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <SkipLinks links={skipLinks} />
      <LiveRegion priority="polite" />

      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Phase 5: Production Polish Demo
        </h1>
        <p className="text-gray-600">
          Showcasing error boundaries, accessibility, performance monitoring, and SEO optimization
        </p>
      </div>

      {/* Error Boundaries Demo */}
      <Card id="error-boundaries" className="p-6">
        <h2 className="text-xl font-semibold mb-4">Error Boundaries</h2>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={handleThrowError} className="bg-red-600 hover:bg-red-700">
              Throw Component Error
            </Button>
            <Button onClick={handleManualError} className="bg-orange-600 hover:bg-orange-700">
              Throw Manual Error
            </Button>
            <Button onClick={handleResetError} variant="outline">
              Reset Error
            </Button>
          </div>
          
          <ErrorBoundary key={errorBoundaryKey}>
            <ErrorThrowingComponent shouldThrow={shouldThrowError} />
          </ErrorBoundary>
        </div>
      </Card>

      {/* Accessibility Demo */}
      <Card id="accessibility" className="p-6">
        <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
        <div className="space-y-6">
          {/* ARIA Live Region */}
          <div>
            <h3 className="font-medium mb-2">ARIA Live Region</h3>
            <div className="flex space-x-2">
              <Button onClick={handleAnnounce}>
                Make Announcement
              </Button>
              <Button onClick={() => setAnnouncements([])} variant="outline">
                Clear Announcements
              </Button>
            </div>
            {announcements.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">Recent announcements:</p>
                <ul className="text-sm text-blue-700">
                  {announcements.map((announcement, index) => (
                    <li key={index}>• {announcement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Accessible Form */}
          <div>
            <h3 className="font-medium mb-2">Accessible Form</h3>
            <form className="space-y-4 max-w-md">
              <AccessibleField
                label="Email Address"
                hint="We'll never share your email"
                required
                error={false ? "Please enter a valid email" : undefined}
              >
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </AccessibleField>
              
              <AccessibleField
                label="Message"
                hint="Tell us what you think"
              >
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter your message"
                />
              </AccessibleField>
              
              <AccessibleButton
                variant="primary"
                onClick={() => handleTrackInteraction("form_submit", "contact_form")}
              >
                Submit Form
              </AccessibleButton>
            </form>
          </div>

          {/* Keyboard Navigation */}
          <div>
            <h3 className="font-medium mb-2">Keyboard Navigation</h3>
            <p className="text-sm text-gray-600 mb-2">
              Use arrow keys to navigate, Enter to select, Escape to clear focus
            </p>
            <div
              ref={focusTrapRef}
              onKeyDown={handleKeyDown}
              className="flex space-x-2 p-2 border border-gray-300 rounded-md"
            >
              {navigationItems.map((item, index) => (
                <button
                  key={item.id}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    focusedIndex === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    focusItem(index);
                    handleTrackInteraction("navigation_click", item.name);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div className="mt-2 flex space-x-2">
              <Button
                onClick={() => setFocusTrapActive(!focusTrapActive)}
                variant="outline"
                size="sm"
              >
                {focusTrapActive ? "Disable" : "Enable"} Focus Trap
              </Button>
              <Button onClick={clearFocus} variant="outline" size="sm">
                Clear Focus
              </Button>
            </div>
          </div>

          {/* Screen Reader Only Text */}
          <div>
            <h3 className="font-medium mb-2">Screen Reader Content</h3>
            <p>
              This text is visible to everyone.{" "}
              <ScreenReaderOnly>
                This text is only visible to screen readers.
              </ScreenReaderOnly>
            </p>
          </div>
        </div>
      </Card>

      {/* Performance Monitoring Demo */}
      <Card id="performance" className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Monitoring</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : "N/A"}
              </div>
              <div className="text-sm text-gray-600">FCP</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : "N/A"}
              </div>
              <div className="text-sm text-gray-600">LCP</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.fid ? `${metrics.fid.toFixed(0)}ms` : "N/A"}
              </div>
              <div className="text-sm text-gray-600">FID</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.cls ? metrics.cls.toFixed(3) : "N/A"}
              </div>
              <div className="text-sm text-gray-600">CLS</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleTrackCustomMetric} variant="outline">
              Track Custom Metric
            </Button>
            <Button onClick={handleTrackError} variant="outline">
              Track Error
            </Button>
            <Button
              onClick={() => handleTrackInteraction("button_click", "performance_demo")}
              variant="outline"
            >
              Track Interaction
            </Button>
          </div>
        </div>
      </Card>

      {/* SEO Demo */}
      <Card id="seo" className="p-6">
        <h2 className="text-xl font-semibold mb-4">SEO & Social Sharing</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Social Sharing</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={shareToTwitter} className="bg-blue-400 hover:bg-blue-500">
                Share on Twitter
              </Button>
              <Button onClick={shareToFacebook} className="bg-blue-600 hover:bg-blue-700">
                Share on Facebook
              </Button>
              <Button onClick={shareToLinkedIn} className="bg-blue-700 hover:bg-blue-800">
                Share on LinkedIn
              </Button>
              <Button onClick={copyToClipboard} variant="outline">
                Copy Link
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">SEO Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Dynamic meta tags based on page content</li>
              <li>• Open Graph tags for social media</li>
              <li>• Twitter Card support</li>
              <li>• Structured data (JSON-LD)</li>
              <li>• Canonical URLs</li>
              <li>• Breadcrumb navigation</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How to Test Phase 5 Features</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Error Boundaries:</strong> Click "Throw Component Error" to see error boundary in action. Check browser dev tools for error details.</p>
          <p><strong>Accessibility:</strong> Use Tab to navigate, arrow keys for the navigation demo, and screen readers to test ARIA announcements.</p>
          <p><strong>Performance:</strong> Watch the Core Web Vitals metrics update in real-time. Click buttons to track custom metrics.</p>
          <p><strong>SEO:</strong> Check page source to see meta tags, or use social sharing buttons to test Open Graph tags.</p>
          <p><strong>Focus Management:</strong> Enable focus trap and use Tab to see focus contained within the navigation area.</p>
        </div>
      </Card>
    </div>
  );
}
