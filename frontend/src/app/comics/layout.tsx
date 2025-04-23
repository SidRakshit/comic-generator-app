// src/app/comics/layout.tsx
import React, { Suspense } from 'react'; // Import Suspense
import ComicProviderWrapper from './comic-provider-wrapper'; // Import the new component
import { Loader2 } from 'lucide-react'; // Example loading indicator

// No longer needs 'use client' here if it doesn't do client things itself
export default function ComicLayout({ children }: { children: React.ReactNode }) {

  return (
    // Wrap the component using client hooks in Suspense
    <Suspense fallback={
      // Optional: Provide a loading UI while the client component loads
      <div className="flex justify-center items-center min-h-screen">
         <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    }>
      {/* Render the wrapper which now contains the provider and hooks */}
      <ComicProviderWrapper>
          <main>{children}</main> {/* Ensure children are passed correctly */}
      </ComicProviderWrapper>
    </Suspense>
  );
}