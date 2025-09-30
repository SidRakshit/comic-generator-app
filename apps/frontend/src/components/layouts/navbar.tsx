// src/components/layouts/navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
import { Button } from "@repo/ui/button";
import {
	COMPONENT_STYLES,
	SEMANTIC_COLORS,
	INTERACTIVE_STYLES,
	UI_CONSTANTS,
} from "@repo/common-types";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const { isLoading, user, handleSignOut } = useAuth();

	const closeMobileMenu = () => setIsOpen(false);
	const { NAV } = COMPONENT_STYLES;

	const renderAuthLinks = (isMobile = false) => {
		if (isLoading) {
			return (
				<div
					className={`flex items-center ${
						isMobile ? "px-4 py-2 h-[36px]" : "ml-6 h-[36px]"
					}`}
				>
					<Loader2 className={`h-5 w-5 animate-spin ${SEMANTIC_COLORS.TEXT.MUTED}`} />
				</div>
			);
		}

		if (user) {
			const desktopProfileClasses = `inline-flex items-center px-2 py-1 text-sm font-medium ${SEMANTIC_COLORS.TEXT.SECONDARY} hover:${SEMANTIC_COLORS.TEXT.PRIMARY} ${INTERACTIVE_STYLES.BUTTON.GHOST} ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} ml-4`;
			const desktopSignOutClasses = `ml-2 ${SEMANTIC_COLORS.TEXT.SECONDARY} hover:${SEMANTIC_COLORS.TEXT.PRIMARY} ${INTERACTIVE_STYLES.BUTTON.GHOST}`;
			const mobileLinkClasses = NAV.MOBILE_INACTIVE;
			const mobileButtonClasses = `w-full text-left ${NAV.MOBILE_INACTIVE}`;

			return (
				<>
					<Link
						href="/profile"
						onClick={closeMobileMenu}
						className={isMobile ? mobileLinkClasses : desktopProfileClasses}
					>
						<User className="h-4 w-4 mr-1" /> Profile
					</Link>
					<Button
						variant="ghost"
						size="sm"
						onClick={async () => {
							closeMobileMenu();
							await handleSignOut();
						}}
						className={isMobile ? mobileButtonClasses : desktopSignOutClasses}
					>
						<LogOut className="h-4 w-4 mr-1" /> Sign Out
					</Button>
				</>
			);
		}

		const mobileLinkClasses = NAV.MOBILE_INACTIVE;
		const desktopLoginClasses = `inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} ${INTERACTIVE_STYLES.BUTTON.SECONDARY} ml-4`;
		const desktopSignupClasses = `inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} ${INTERACTIVE_STYLES.BUTTON.PRIMARY} ml-2`;

		return (
			<>
				<Link
					href="/login"
					onClick={closeMobileMenu}
					className={isMobile ? mobileLinkClasses : desktopLoginClasses}
				>
					<LogIn className="h-4 w-4 mr-1" /> Login
				</Link>
				<Link
					href="/signup"
					onClick={closeMobileMenu}
					className={isMobile ? mobileLinkClasses : desktopSignupClasses}
				>
					<UserPlus className="h-4 w-4 mr-1" /> Sign Up
				</Link>
			</>
		);
	};

	const renderCreateLink = (isMobile = false) => {
		if (isLoading) {
			return (
				<span className={isMobile ? NAV.MOBILE_LOADING : NAV.DESKTOP_LOADING}>
					<PlusCircle className="h-4 w-4 mr-1" /> Create
				</span>
			);
		}

		if (user) {
			return (
				<Link
					href="/comics/create"
					onClick={closeMobileMenu}
					className={isMobile ? NAV.MOBILE_ACTIVE : NAV.DESKTOP_ACTIVE}
				>
					<PlusCircle className="h-4 w-4 mr-1" /> Create
				</Link>
			);
		}

		return (
			<Link
				href="/signup"
				onClick={closeMobileMenu}
				className={isMobile ? NAV.MOBILE_INACTIVE : NAV.DESKTOP_INACTIVE}
				title="Login to create comics"
			>
				<PlusCircle className="h-4 w-4 mr-1" /> Create
			</Link>
		);
	};

	return (
		<nav className={`${SEMANTIC_COLORS.BACKGROUND.PRIMARY} shadow-sm sticky top-0 ${UI_CONSTANTS.Z_INDEX.NAVBAR}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link href="/" className={`font-bold text-xl ${SEMANTIC_COLORS.BRAND.PRIMARY}`}>
								Comic Creator
							</Link>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
							<Link href="/" className={NAV.DESKTOP_INACTIVE}>
								<Home className="h-4 w-4 mr-1" /> Home
							</Link>
							{/* <Link href="/comics" className={NAV.DESKTOP_INACTIVE}>
								<BookOpen className="h-4 w-4 mr-1" /> Browse
							</Link> */}
							{renderCreateLink(false)}
						</div>
					</div>

					<div className="hidden sm:ml-6 sm:flex sm:items-center">
						{renderAuthLinks(false)}
					</div>

					<div className="-mr-2 flex items-center sm:hidden">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className={`inline-flex items-center justify-center p-2 ${UI_CONSTANTS.BORDER_RADIUS.MEDIUM} ${SEMANTIC_COLORS.TEXT.DISABLED} hover:${SEMANTIC_COLORS.TEXT.MUTED} ${INTERACTIVE_STYLES.BUTTON.GHOST} focus:outline-none focus:ring-2 focus:ring-inset focus:${SEMANTIC_COLORS.BRAND.PRIMARY_BORDER}`}
							aria-controls="mobile-menu"
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

			<div
				className={`${isOpen ? "block" : "hidden"} sm:hidden border-t ${SEMANTIC_COLORS.BORDER.DEFAULT}`}
				id="mobile-menu"
			>
				<div className="pt-2 pb-3 space-y-1">
					<Link
						href="/"
						onClick={closeMobileMenu}
						className={NAV.MOBILE_INACTIVE}
					>
						<Home className="inline-block h-4 w-4 mr-1" /> Home
					</Link>
					{/* <Link
						href="/comics"
						onClick={closeMobileMenu}
						className={NAV.MOBILE_INACTIVE}
					>
						<BookOpen className="inline-block h-4 w-4 mr-1" /> Browse
					</Link> */}
					{renderCreateLink(true)}
				</div>
				<div className={`pt-4 pb-3 border-t ${SEMANTIC_COLORS.BORDER.DEFAULT}`}>
					<div className="px-2 space-y-1">{renderAuthLinks(true)}</div>
				</div>
			</div>
		</nav>
	);
}
