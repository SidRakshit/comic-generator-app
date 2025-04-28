// src/app/comics/layout.tsx
import React, { Suspense } from 'react';
import ComicProviderWrapper from './comic-provider-wrapper';
import { Loader2 } from 'lucide-react';

export default function ComicLayout({ children }: { children: React.ReactNode }) {

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
         <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    }>
      <ComicProviderWrapper>
          <main>{children}</main>
      </ComicProviderWrapper>
    </Suspense>
  );
}