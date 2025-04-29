// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react"; // Added useEffect
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api"; // Import apiRequest
import {
	User,
	Edit,
	Save,
	Image as ImageIcon,
	BookOpen,
	Heart,
	Settings,
	ChevronRight,
	PlusCircle,
	Mail,
	Globe,
	Twitter,
	Loader2, // Added Loader2
} from "lucide-react";

// Interface matching backend's list response item
interface ComicListItem {
	comic_id: string;
	title: string;
	created_at: string; // Or Date if you parse it
	updated_at: string; // Or Date
	// coverImage: string; // Add if backend provides it
	// likes: number; // Add if backend provides it
}

// Mock profile data (replace with fetched data if needed)
const initialUserData = {
	username: "ComicFan2024",
	name: "Alex Johnson",
	bio: "Comic enthusiast and amateur storyteller. I love creating sci-fi and fantasy comics!",
	avatarUrl: "/api/placeholder/150/150",
	joinDate: "March, 2024",
	email: "alex.johnson@example.com",
	website: "alexjohnson.example.com",
	twitter: "@comicfan2024",
	stats: { created: 0, favorites: 38, followers: 127, following: 84 },
}; // Initial created count is 0
const userFavoriteComics = [
	/* Keep mock favorites or fetch them too */ {
		id: "comic-4",
		title: "Heroes of Tomorrow",
		author: "CosmicCreator",
		coverImage: "/api/placeholder/300/400?text=Heroes+Tomorrow",
		likes: 87,
	},
	{
		id: "comic-5",
		title: "Mystery Island",
		author: "StoryWeaver",
		coverImage: "/api/placeholder/300/400?text=Mystery+Island",
		likes: 56,
	},
];

export default function ProfilePage() {
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [profileData, setProfileData] = useState(initialUserData);

	// State for fetched comics
	const [myComics, setMyComics] = useState<ComicListItem[]>([]);
	const [isLoadingComics, setIsLoadingComics] = useState(true);
	const [errorLoadingComics, setErrorLoadingComics] = useState<string | null>(
		null
	);

	// Fetch user's comics on component mount
	useEffect(() => {
		const fetchComics = async () => {
			setIsLoadingComics(true);
			setErrorLoadingComics(null);
			try {
				const data = await apiRequest<ComicListItem[]>("/comics", "GET");
				setMyComics(data || []);
				// Update profile stats if needed (or fetch profile data too)
				setProfileData((prev) => ({
					...prev,
					stats: { ...prev.stats, created: data?.length || 0 },
				}));
			} catch (err) {
				console.error("Failed to fetch user comics:", err);
				setErrorLoadingComics(
					err instanceof Error ? err.message : "Failed to load comics."
				);
			} finally {
				setIsLoadingComics(false);
			}
		};

		fetchComics();
	}, []); // Run once on mount

	const handleSaveProfile = () => {
		// Add API call here to save profile changes if needed
		setIsEditingProfile(false);
		// Optionally refetch profile data
	};

	// Helper to format date (optional)
	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch (e) {
			return "Invalid Date";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 pb-12">
			{/* Profile header */}
			<div className="bg-white shadow">
				{/* ... (Profile header JSX remains largely the same, using profileData state) ... */}
				{/* Example update for created count */}
				<div className="grid grid-cols-2 gap-4 text-center">
					<div className="bg-gray-50 px-4 py-2 rounded-lg">
						<div className="text-2xl font-bold text-gray-900">
							{profileData.stats.created}
						</div>
						<div className="text-sm text-gray-500">Comics</div>
					</div>
					{/* Other stats */}
				</div>
				{/* ... */}
			</div>

			{/* Profile content */}
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
				<Tabs defaultValue="comics">
					<TabsList className="mb-8">
						<TabsTrigger value="comics" className="flex items-center">
							{" "}
							<BookOpen size={16} className="mr-1" /> My Comics{" "}
						</TabsTrigger>
						<TabsTrigger value="favorites" className="flex items-center">
							{" "}
							<Heart size={16} className="mr-1" /> Favorites{" "}
						</TabsTrigger>
						<TabsTrigger value="settings" className="flex items-center">
							{" "}
							<Settings size={16} className="mr-1" /> Settings{" "}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="comics" className="space-y-6">
						<div className="flex justify-between items-center">
							<h2 className="text-xl font-bold text-gray-900">My Comics</h2>
							<Link
								href="/comics/create"
								className="flex items-center text-blue-600 hover:text-blue-800"
							>
								<PlusCircle size={16} className="mr-1" /> Create New Comic
							</Link>
						</div>

						{/* Conditional Rendering based on fetch state */}
						{isLoadingComics && (
							<div className="text-center py-12">
								<Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-500" />
								<p className="mt-2 text-gray-600">Loading your comics...</p>
							</div>
						)}

						{errorLoadingComics && !isLoadingComics && (
							<div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
								<BookOpen size={48} className="mx-auto text-red-400 mb-4" />
								<h3 className="text-lg font-medium text-red-700 mb-2">
									Error Loading Comics
								</h3>
								<p className="text-red-600 mb-4">{errorLoadingComics}</p>
								<Button
									variant="outline"
									onClick={() => window.location.reload()}
								>
									{" "}
									Try Again{" "}
								</Button>
							</div>
						)}

						{!isLoadingComics &&
							!errorLoadingComics &&
							myComics.length === 0 && (
								<div className="text-center py-12 bg-white rounded-lg border">
									<BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										No comics yet
									</h3>
									<p className="text-gray-600 mb-4">
										Start creating your first comic!
									</p>
									<Button asChild>
										<Link href="/comics/create"> Get Started </Link>
									</Button>
								</div>
							)}

						{!isLoadingComics && !errorLoadingComics && myComics.length > 0 && (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{myComics.map((comic) => (
									// Use the actual comic_id from the fetched data
									<Link href={`/comics/${comic.comic_id}`} key={comic.comic_id}>
										<div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
											{/* Placeholder for Cover Image - Use API or default */}
											<div className="aspect-[3/4] bg-gray-100 relative flex items-center justify-center">
												{/* Replace with actual Image component if cover exists */}
												<ImageIcon className="w-16 h-16 text-gray-300" />
												<span className="absolute bottom-2 text-xs text-gray-400">
													No Cover
												</span>
											</div>
											<div className="p-4">
												<h3 className="font-medium text-lg text-gray-900 mb-1 truncate">
													{comic.title}
												</h3>
												<div className="flex justify-between text-sm text-gray-500">
													{/* Display formatted updated_at or created_at date */}
													<span>Updated: {formatDate(comic.updated_at)}</span>
													{/* Add likes display if data available */}
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						)}
					</TabsContent>

					{/* Favorites Tab Content (remains mostly the same using mock data or fetch if needed) */}
					<TabsContent value="favorites" className="space-y-6">
						{/* ... Favorite comics rendering ... */}
					</TabsContent>

					{/* Settings Tab Content (remains mostly the same, add API calls for saving) */}
					<TabsContent value="settings" className="space-y-6">
						{/* ... Settings form JSX ... */}
						{/* Add onSubmit handlers and apiRequest calls to save settings */}
						{/* Example Save Settings Button */}
						<div className="pt-5 border-t border-gray-200">
							<div className="flex justify-end">
								<Button
									type="button"
									onClick={() => {
										/* Call API to save settings */
									}}
								>
									{" "}
									Save Settings{" "}
								</Button>
							</div>
						</div>
						{/* ... Other settings sections ... */}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
