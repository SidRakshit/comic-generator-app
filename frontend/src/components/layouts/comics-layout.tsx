'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { PlusCircle, Grid, Award, Clock, BookOpen } from 'lucide-react';

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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">Comics</h2>
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/comics"
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${
                      isActive('/comics') && !isActive('/comics/create')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    All Comics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/comics/create"
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${
                      isActive('/comics/create')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
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
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Featured
                  </Link>
                </li>
                <li>
                  <Link
                    href="/comics?category=latest"
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Latest
                  </Link>
                </li>
                <li>
                  <Link
                    href="/comics?view=grid"
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Gallery View
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="bg-white rounded-lg shadow mt-4 p-4">
            <h3 className="font-medium mb-2">My Comics</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                You have <span className="font-semibold">3</span> published comics.
              </p>
              <Link
                href="/profile/comics"
                className="text-sm text-blue-600 hover:text-blue-800"
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