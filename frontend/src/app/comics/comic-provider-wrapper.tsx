// src/app/comics/comic-provider-wrapper.tsx
'use client'; // Mark this new component as a client component

import React from 'react';
import { ComicProvider } from '@/context/comic-context';
import { useParams, useSearchParams } from 'next/navigation';

export default function ComicProviderWrapper({ children }: { children: React.ReactNode }) {
  // Move the hooks and logic inside this component
  const params = useParams();
  const searchParams = useSearchParams();

  const comicId = params?.id as string | undefined;
  const templateId = searchParams?.get('templateId');

  return (
    <ComicProvider
        initialComicId={comicId}
        initialTemplateId={templateId ?? undefined}
    >
      {children}
    </ComicProvider>
  );
}