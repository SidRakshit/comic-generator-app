// src/components/layouts/navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context'; // Import the auth context hook
import { Menu, X, User, LogOut, LogIn, UserPlus, BookOpen, Home, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const { user, userId, isLoading, handleSignOut } = useAuth(); // Get auth state and functions

  const closeMobileMenu = () => setIsOpen(false);

  const renderAuthLinks = (isMobile = false) => {
    if (isLoading) {
      return (
        <div className={`flex items-center ${isMobile ? 'px-4 py-2' : 'ml-6'}`}>
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      );
    }

    if (user) {
      // --- User is Logged In ---
      return (
        <>
          <Link
            href="/profile" // Link to the user's profile page
            onClick={closeMobileMenu}
            className={isMobile
              ? "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              : "inline-flex items-center px-2 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md ml-4" // Added ml-4 for spacing
            }
          >
            <User className="h-4 w-4 mr-1" />
            Profile
          </Link>
          <Button
            variant={isMobile ? "ghost" : "ghost"}
            size="sm"
            onClick={async () => {
                closeMobileMenu();
                await handleSignOut(); // Call sign out function from context
                // Optionally redirect after sign out (handled in context or here)
                // router.push('/');
            }}
            className={isMobile
              ? "w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              : "ml-2" // Added margin for desktop
            }
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </>
      );
    } else {
      // --- User is Logged Out ---
      return (
        <>
          <Link
            href="/login"
            onClick={closeMobileMenu}
            className={isMobile
                ? "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                : "inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 ml-4" // Style as a subtle button
            }
          >
            <LogIn className="h-4 w-4 mr-1" />
            Login
          </Link>
          <Link
            href="/signup"
            onClick={closeMobileMenu}
            className={isMobile
                ? "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                : "inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ml-2" // Style as primary button
            }
          >
             <UserPlus className="h-4 w-4 mr-1" />
            Sign Up
          </Link>
        </>
      );
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50"> {/* Increased z-index */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo and main links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-blue-600">
                Comic Creator
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Consider hiding 'Create' if user is not logged in */}
              {/* Or redirect to login if clicked when logged out */}
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link
                href="/comics" // Link to browse comics page (assuming it exists)
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Browse
              </Link>
              {/* Only show Create link prominently if logged in, maybe? */}
              {user && (
                 <Link
                    href="/comics/create"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600"
                 >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Create
                 </Link>
              )}
            </div>
          </div>

          {/* Right side: Auth links (Desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {renderAuthLinks(false)}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200`}>
        <div className="pt-2 pb-3 space-y-1">
          {/* Mobile navigation links */}
          <Link href="/" onClick={closeMobileMenu} className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"> <Home className="inline-block h-4 w-4 mr-1" /> Home </Link>
          <Link href="/comics" onClick={closeMobileMenu} className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"> <BookOpen className="inline-block h-4 w-4 mr-1" /> Browse </Link>
          {user && ( // Only show Create if logged in on mobile too
             <Link href="/comics/create" onClick={closeMobileMenu} className="block pl-3 pr-4 py-2 border-l-4 border-blue-500 bg-blue-50 text-base font-medium text-blue-700"> <PlusCircle className="inline-block h-4 w-4 mr-1" /> Create </Link>
          )}
        </div>
        {/* Mobile authentication links */}
        <div className="pt-4 pb-3 border-t border-gray-200">
           <div className="px-2 space-y-1">
             {renderAuthLinks(true)}
           </div>
        </div>
      </div>
    </nav>
  );
}
