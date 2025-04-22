'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, LogOut, BookOpen, Home, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-blue-600">
                Comic Creator
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link
                href="/comics"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Browse Comics
              </Link>
              <Link
                href="/comics/create"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Create
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
          <Link href="/profile" className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md">
  <User className="h-4 w-4 mr-1" />
  Profile
</Link>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            <Home className="inline-block h-4 w-4 mr-1" />
            Home
          </Link>
          <Link
            href="/comics"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            <BookOpen className="inline-block h-4 w-4 mr-1" />
            Browse Comics
          </Link>
          <Link
            href="/comics/create"
            className="block pl-3 pr-4 py-2 border-l-4 border-blue-500 bg-blue-50 text-base font-medium text-blue-700"
          >
            <PlusCircle className="inline-block h-4 w-4 mr-1" />
            Create
          </Link>
          <div className="border-t border-gray-200 pt-4">
            <Link
              href="/profile"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            >
              <User className="inline-block h-4 w-4 mr-1" />
              Profile
            </Link>
            <button
              className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
            >
              <LogOut className="inline-block h-4 w-4 mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}