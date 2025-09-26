'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { PlusCircle, Grid, Award, Clock, BookOpen } from 'lucide-react';
import { SEMANTIC_COLORS, UI_CONSTANTS, INTERACTIVE_STYLES } from '@repo/common-types';

interface ComicsLayoutProps {
  children: ReactNode;
  currentPath?: string;
}

export default function ComicsLayout({ children, currentPath = '' }: ComicsLayoutProps) {
  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow overflow-hidden`}>
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">Comics</h2>
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/comics"
                    className={`flex items-center px-3 py-2 ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} text-sm ${
                      isActive('/comics') && !isActive('/comics/create')
                        ? `${SEMANTIC_COLORS.BACKGROUND.ACCENT_LIGHT} ${SEMANTIC_COLORS.TEXT.ACCENT}`
                        : `${SEMANTIC_COLORS.TEXT.SECONDARY} ${INTERACTIVE_STYLES.BUTTON.HOVER_LIGHT}`
                    }`}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    All Comics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/comics/create"
                    className={`flex items-center px-3 py-2 ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} text-sm ${
                      isActive('/comics/create')
                        ? `${SEMANTIC_COLORS.BACKGROUND.ACCENT_LIGHT} ${SEMANTIC_COLORS.TEXT.ACCENT}`
                        : `${SEMANTIC_COLORS.TEXT.SECONDARY} ${INTERACTIVE_STYLES.BUTTON.HOVER_LIGHT}`
                    }`}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New
                  </Link>
                </li>
                <li className="pt-2 border-t">
                  <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categories
                  </h3>
                </li>
                <li>
                  <Link
                    href="/comics?category=featured"
                    className="flex items-center px-3 py-2 ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} text-sm ${SEMANTIC_COLORS.TEXT.SECONDARY} ${INTERACTIVE_STYLES.BUTTON.HOVER_LIGHT}"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Featured
                  </Link>
                </li>
                <li>
                  <Link
                    href="/comics?category=latest"
                    className="flex items-center px-3 py-2 ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} text-sm ${SEMANTIC_COLORS.TEXT.SECONDARY} ${INTERACTIVE_STYLES.BUTTON.HOVER_LIGHT}"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Latest
                  </Link>
                </li>
                <li>
                  <Link
                    href="/comics?view=grid"
                    className="flex items-center px-3 py-2 ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} text-sm ${SEMANTIC_COLORS.TEXT.SECONDARY} ${INTERACTIVE_STYLES.BUTTON.HOVER_LIGHT}"
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Gallery View
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} shadow mt-4 p-4`}>
            <h3 className="font-medium mb-2">My Comics</h3>
            <div className="space-y-2">
              <p className="text-sm ${SEMANTIC_COLORS.TEXT.SECONDARY}">
                You have <span className="font-semibold">3</span> published comics.
              </p>
              <Link
                href="/profile/comics"
                className="text-sm ${SEMANTIC_COLORS.TEXT.ACCENT} ${INTERACTIVE_STYLES.TEXT.HOVER_ACCENT}"
              >
                View all my comics
              </Link>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}