// src/components/layouts/navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth"; // Use the custom hook
import {
	Menu,
	X,
	User,
	LogOut,
	LogIn,
	UserPlus,
	BookOpen,
	Home,
	PlusCircle,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const { isLoading, user, handleSignOut } = useAuth();

	const closeMobileMenu = () => setIsOpen(false);

	// --- DEFINE COMMON STYLES HERE ---
	// These are now accessible throughout the Navbar component scope
	const mobileLoadingClasses =
		"flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-400 cursor-not-allowed";
	const desktopLoadingClasses =
		"inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-400 cursor-not-allowed";
	const mobileActiveClasses =
		"flex items-center pl-3 pr-4 py-2 border-l-4 border-blue-500 bg-blue-50 text-base font-medium text-blue-700";
	const desktopActiveClasses =
		"inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600";
	const mobileInactiveClasses =
		"flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800";
	const desktopInactiveClasses =
		"inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300";
	// --- END COMMON STYLE DEFINITIONS ---

	// Helper function for auth links (doesn't need the style vars above)
	const renderAuthLinks = (isMobile = false) => {
		if (isLoading) {
			return (
				<div
					className={`flex items-center ${
						isMobile ? "px-4 py-2 h-[36px]" : "ml-6 h-[36px]"
					}`}
				>
					<Loader2 className="h-5 w-5 animate-spin text-gray-500" />
				</div>
			);
		}
		if (user) {
			const desktopProfileClasses =
				"inline-flex items-center px-2 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md ml-4";
			const desktopSignOutClasses =
				"ml-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100";
			const mobileLinkClasses =
				"flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800";
			const mobileButtonClasses =
				"w-full text-left flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800";
			return (
				<>
					{" "}
					<Link
						href="/profile"
						onClick={closeMobileMenu}
						className={isMobile ? mobileLinkClasses : desktopProfileClasses}
					>
						{" "}
						<User className="h-4 w-4 mr-1" /> Profile{" "}
					</Link>{" "}
					<Button
						variant="ghost"
						size="sm"
						onClick={async () => {
							closeMobileMenu();
							await handleSignOut();
						}}
						className={isMobile ? mobileButtonClasses : desktopSignOutClasses}
					>
						{" "}
						<LogOut className="h-4 w-4 mr-1" /> Sign Out{" "}
					</Button>{" "}
				</>
			);
		} else {
			const mobileLinkClasses =
				"flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800";
			const desktopLoginClasses =
				"inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 ml-4";
			const desktopSignupClasses =
				"inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ml-2";
			return (
				<>
					{" "}
					<Link
						href="/login"
						onClick={closeMobileMenu}
						className={isMobile ? mobileLinkClasses : desktopLoginClasses}
					>
						{" "}
						<LogIn className="h-4 w-4 mr-1" /> Login{" "}
					</Link>{" "}
					<Link
						href="/signup"
						onClick={closeMobileMenu}
						className={isMobile ? mobileLinkClasses : desktopSignupClasses}
					>
						{" "}
						<UserPlus className="h-4 w-4 mr-1" /> Sign Up{" "}
					</Link>{" "}
				</>
			);
		}
	};

	// Helper function for Create link (uses styles defined above)
	const renderCreateLink = (isMobile = false) => {
		if (isLoading) {
			return (
				<span
					className={isMobile ? mobileLoadingClasses : desktopLoadingClasses}
				>
					{" "}
					<PlusCircle className="h-4 w-4 mr-1" /> Create{" "}
				</span>
			);
		}
		if (user) {
			return (
				<Link
					href="/comics/create"
					onClick={closeMobileMenu}
					className={isMobile ? mobileActiveClasses : desktopActiveClasses}
				>
					{" "}
					<PlusCircle className="h-4 w-4 mr-1" /> Create{" "}
				</Link>
			);
		} else {
			return (
				<Link
					href="/signup"
					onClick={closeMobileMenu}
					className={isMobile ? mobileInactiveClasses : desktopInactiveClasses}
					title="Login to create comics"
				>
					{" "}
					<PlusCircle className="h-4 w-4 mr-1" /> Create{" "}
				</Link>
			);
		}
	};

	// --- Main Component Render ---
	return (
		<nav className="bg-white shadow-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					{/* Left side */}
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link href="/" className="font-bold text-xl text-blue-600">
								{" "}
								Comic Creator{" "}
							</Link>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
							{/* Use common style variables */}
							<Link href="/" className={desktopInactiveClasses}>
								{" "}
								<Home className="h-4 w-4 mr-1" /> Home{" "}
							</Link>
							{/* <Link href="/comics" className={desktopInactiveClasses}>
								{" "}
								<BookOpen className="h-4 w-4 mr-1" /> Browse{" "}
							</Link> */}
							{/* Render dynamic Create link */}
							{renderCreateLink(false)}
						</div>
					</div>

					{/* Right side */}
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
							{" "}
							<span className="sr-only">Open main menu</span>{" "}
							{isOpen ? (
								<X className="block h-6 w-6" aria-hidden="true" />
							) : (
								<Menu className="block h-6 w-6" aria-hidden="true" />
							)}{" "}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			<div
				className={`${
					isOpen ? "block" : "hidden"
				} sm:hidden border-t border-gray-200`}
				id="mobile-menu"
			>
				<div className="pt-2 pb-3 space-y-1">
					{/* Use common style variables */}
					<Link
						href="/"
						onClick={closeMobileMenu}
						className={mobileInactiveClasses}
					>
						{" "}
						<Home className="inline-block h-4 w-4 mr-1" /> Home{" "}
					</Link>
					{/* <Link
						href="/comics"
						onClick={closeMobileMenu}
						className={mobileInactiveClasses}
					>
						{" "}
						<BookOpen className="inline-block h-4 w-4 mr-1" /> Browse{" "}
					</Link> */}
					{/* Render dynamic Create link */}
					{renderCreateLink(true)}
				</div>
				{/* Auth links */}
				<div className="pt-4 pb-3 border-t border-gray-200">
					<div className="px-2 space-y-1">{renderAuthLinks(true)}</div>
				</div>
			</div>
		</nav>
	);
}
