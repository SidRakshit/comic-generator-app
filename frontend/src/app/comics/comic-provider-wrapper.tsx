// src/app/comics/comic-provider-wrapper.tsx
'use client';

import React from 'react';
import { ComicProvider } from '@/context/comic-context';
import { useParams, useSearchParams } from 'next/navigation';

export default function ComicProviderWrapper({ children }: { children: React.ReactNode }) {
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