// src/components/layouts/navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context'; // Import the auth context hook
import { Menu, X, User, LogOut, LogIn, UserPlus, BookOpen, Home, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  // Get auth state and functions from the context
  // Destructure isLoading FIRST to use it for conditional rendering
  const { isLoading, user, handleSignOut } = useAuth();

  const closeMobileMenu = () => setIsOpen(false);

  // Helper function to render authentication-related links/buttons
  const renderAuthLinks = (isMobile = false) => {
    // Show loading indicator OR null during initial load or configuration phase
    // This prevents rendering auth buttons before context is ready, especially during build/SSR attempts
    if (isLoading) {
      return (
        <div className={`flex items-center ${isMobile ? 'px-4 py-2 h-[36px]' : 'ml-6 h-[36px]'}`}> {/* Ensure consistent height */}
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      );
      // Alternatively return null: return null;
    }

    // If user object exists, the user is logged in
    if (user) {
      return (
        <>
          {/* Profile Link */}
          <Link
            href="/profile"
            onClick={closeMobileMenu}
            className={isMobile
              ? "flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              : "inline-flex items-center px-2 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md ml-4"
            }
          >
            <User className="h-4 w-4 mr-1" />
            Profile
          </Link>
          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
                closeMobileMenu();
                await handleSignOut();
            }}
            className={isMobile
              ? "w-full text-left flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              : "ml-2"
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
          {/* Login Link/Button */}
          <Link
            href="/login"
            onClick={closeMobileMenu}
            className={isMobile
                ? "flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                : "inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 ml-4"
            }
          >
            <LogIn className="h-4 w-4 mr-1" />
            Login
          </Link>
          {/* Sign Up Link/Button */}
          <Link
            href="/signup"
            onClick={closeMobileMenu}
            className={isMobile
                ? "flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                : "inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ml-2"
            }
          >
             <UserPlus className="h-4 w-4 mr-1" />
            Sign Up
          </Link>
        </>
      );
    }
  };

  // Helper function to render the 'Create' link/placeholder
  const renderCreateLink = (isMobile = false) => {
     // Also check isLoading here before deciding based on user
     if (isLoading) {
         return (
             <span className={isMobile
                 ? "flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-400 cursor-not-allowed"
                 : "inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-400 cursor-not-allowed"
             }>
                 <PlusCircle className="h-4 w-4 mr-1" /> Create
             </span>
         );
     }

     if (user) {
         return (
             <Link
                href="/comics/create"
                onClick={closeMobileMenu}
                className={isMobile
                    ? "flex items-center pl-3 pr-4 py-2 border-l-4 border-blue-500 bg-blue-50 text-base font-medium text-blue-700"
                    : "inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600"
                }
             >
                <PlusCircle className="h-4 w-4 mr-1" /> Create
             </Link>
         );
     } else {
         // Render disabled/non-clickable Create link if logged out
         return (
             <span
                className={isMobile
                    ? "flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-400 cursor-not-allowed"
                    : "inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-400 cursor-not-allowed"
                }
                title="Login to create comics"
             >
                <PlusCircle className="h-4 w-4 mr-1" /> Create
             </span>
         );
     }
  };


  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
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
              {/* Standard navigation links */}
              <Link href="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"> <Home className="h-4 w-4 mr-1" /> Home </Link>
              <Link href="/comics" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"> <BookOpen className="h-4 w-4 mr-1" /> Browse </Link>
              {/* Render Create link/placeholder */}
              {renderCreateLink(false)}
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
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {/* Mobile navigation links */}
          <Link href="/" onClick={closeMobileMenu} className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"> <Home className="inline-block h-4 w-4 mr-1" /> Home </Link>
          <Link href="/comics" onClick={closeMobileMenu} className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"> <BookOpen className="inline-block h-4 w-4 mr-1" /> Browse </Link>
          {/* Render Create link/placeholder for mobile */}
          {renderCreateLink(true)}
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
