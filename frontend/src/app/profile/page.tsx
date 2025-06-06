// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
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
	Loader2,
} from "lucide-react";

// Interface matching backend's list response item
interface ComicListItem {
	comic_id: string;
	title: string;
	created_at: string; // Or Date if you parse it
	updated_at: string; // Or Date
	// Add other fields if your API returns them (e.g., coverImage, likes)
}

// Initial user data structure (consider fetching this too if needed)
const initialUserData = {
	username: "User",
	name: "Comic Creator",
	bio: "Loading profile...",
	avatarUrl: "/api/placeholder/150/150",
	joinDate: "",
	email: "",
	website: "",
	twitter: "",
	stats: { created: 0, favorites: 0, followers: 0, following: 0 },
};
// Mock favorites (replace with fetched data if implementing)
const userFavoriteComics = [
	{
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
	// Consider fetching profileData instead of using only initialUserData
	const [profileData, setProfileData] = useState(initialUserData);

	// State for fetched comics
	const [myComics, setMyComics] = useState<ComicListItem[]>([]);
	const [isLoadingComics, setIsLoadingComics] = useState(true); // Track comic loading
	const [errorLoadingComics, setErrorLoadingComics] = useState<string | null>(
		null
	);

	// Get auth state from context
	const {
		user,
		isLoading: isLoadingAuth,
		attributes,
		error: authError,
	} = useAuth();
	const isAuthenticated = !!user && !isLoadingAuth;

	// Update profile data from context once auth loads (optional)
	useEffect(() => {
		if (!isLoadingAuth && isAuthenticated && user) {
			setProfileData((prev) => ({
				...prev,
				// Basic info from user object
				username: user.username || prev.username,
				// Details from attributes object (use optional chaining)
				email: attributes?.email || prev.email, // <-- Access directly
				name: attributes?.name || prev.name, // <-- Access directly
				// Add others like given_name, family_name if needed
				// joinDate: attributes?.updated_at ? formatDate(attributes.updated_at) : '', // Example
			}));
		} else if (!isLoadingAuth && !isAuthenticated) {
			setProfileData(initialUserData);
		}
		if (authError) {
			console.error("Authentication Error:", authError);
			// Update error state if needed: setErrorLoadingComics(...)
		}
	}, [isLoadingAuth, isAuthenticated, user, attributes, authError]);

	// Fetch user's comics, dependent on auth state
	useEffect(() => {
		if (isLoadingAuth) {
			console.log("ProfilePage: Waiting for authentication...");
			setIsLoadingComics(true); // Show loading while waiting for auth
			return;
		}

		if (isAuthenticated) {
			console.log(
				"ProfilePage: Auth loaded, user authenticated. Fetching comics..."
			);
			const fetchComics = async () => {
				setIsLoadingComics(true);
				setErrorLoadingComics(null);
				try {
					const data = await apiRequest<ComicListItem[]>("/comics", "GET");
					setMyComics(data || []);
					// Update created count based on fetched data
					setProfileData((prev) => ({
						...prev,
						stats: { ...prev.stats, created: data?.length || 0 },
					}));
				} catch (err: unknown) {
					console.error("Failed to fetch user comics:", err);
					setErrorLoadingComics(
						err instanceof Error ? err.message : "Failed to load comics."
					);
				} finally {
					setIsLoadingComics(false);
				}
			};
			fetchComics();
		} else {
			console.log("ProfilePage: Auth loaded, user is not authenticated.");
			setErrorLoadingComics("Please log in to view your profile and comics.");
			setIsLoadingComics(false);
			setMyComics([]);
			setProfileData((prev) => ({
				...prev,
				stats: { ...prev.stats, created: 0 },
			})); // Reset count
		}
	}, [isLoadingAuth, isAuthenticated]); // Re-run when auth state changes

	// --- Profile Edit Handlers (Keep or modify as needed) ---
	const handleSaveProfile = () => {
		// TODO: Add API call here to save profileData to your backend
		console.log("Saving profile data (API call needed):", profileData);
		setIsEditingProfile(false);
	};

	const handleCancelEditProfile = () => {
		setIsEditingProfile(false);
		// TODO: Reset profileData state to originally loaded data (may require fetching original data)
		// For now, just resets to initial state - may lose unsaved fetched data
		// setProfileData(initialUserData); // Or reset to data fetched in the other useEffect
	};

	// Helper to format date
	const formatDate = (dateString: string): string => {
		try {
			return new Date(dateString).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		} catch (e) {
			return "Invalid Date";
		}
	};

	// --- Render JSX ---
	return (
		<div className="min-h-screen bg-gray-50 pb-12">
			{/* Profile header */}
			<div className="bg-white shadow">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Basic loading state for header */}
					{isLoadingAuth ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
						</div>
					) : (
						<div className="flex flex-col md:flex-row items-center md:items-start">
							{/* Avatar */}
							<div className="relative mb-4 md:mb-0 md:mr-6 flex-shrink-0">
								<Image
									src={profileData.avatarUrl} // Use dynamic avatar if available
									alt={`${profileData.name}'s avatar`}
									width={128}
									height={128}
									className="rounded-full object-cover border-4 border-white shadow"
									priority // Prioritize loading avatar image
								/>
								{isEditingProfile && (
									<button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700">
										<ImageIcon size={16} />
									</button>
								)}
							</div>

							{/* Profile Info & Edit Form */}
							<div className="flex-1 text-center md:text-left">
								{isEditingProfile ? (
									<div className="space-y-3">
										{/* Edit fields */}
										<div>
											{" "}
											<label className="block text-sm font-medium text-gray-700">
												Display Name
											</label>{" "}
											<input
												type="text"
												value={profileData.name}
												onChange={(e) =>
													setProfileData({
														...profileData,
														name: e.target.value,
													})
												}
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
											/>{" "}
										</div>
										<div>
											{" "}
											<label className="block text-sm font-medium text-gray-700">
												Username
											</label>{" "}
											<input
												type="text"
												value={profileData.username}
												disabled
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
											/>{" "}
										</div>{" "}
										{/* Usually username is not editable */}
										<div>
											{" "}
											<label className="block text-sm font-medium text-gray-700">
												Bio
											</label>{" "}
											<textarea
												value={profileData.bio}
												onChange={(e) =>
													setProfileData({
														...profileData,
														bio: e.target.value,
													})
												}
												rows={3}
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
											/>{" "}
										</div>
									</div>
								) : (
									<>
										<h1 className="text-2xl font-bold text-gray-900">
											{profileData.name}
										</h1>
										<p className="text-gray-600">@{profileData.username}</p>
										<p className="mt-2 text-gray-700 max-w-2xl">
											{profileData.bio}
										</p>
									</>
								)}
								{/* Edit/Save Buttons - only show if authenticated */}
								{isAuthenticated && (
									<div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
										{isEditingProfile ? (
											<>
												<Button
													onClick={handleSaveProfile}
													className="flex items-center"
												>
													{" "}
													<Save size={16} className="mr-1" /> Save Changes{" "}
												</Button>
												<Button
													variant="outline"
													onClick={handleCancelEditProfile}
												>
													{" "}
													Cancel{" "}
												</Button>
											</>
										) : (
											<Button
												variant="outline"
												className="flex items-center"
												onClick={() => setIsEditingProfile(true)}
											>
												{" "}
												<Edit size={16} className="mr-1" /> Edit Profile{" "}
											</Button>
										)}
									</div>
								)}
							</div>

							{/* Stats */}
							<div className="mt-6 md:mt-0 flex flex-col items-center md:items-end space-y-2 w-full md:w-auto">
								<div className="grid grid-cols-2 gap-4 text-center">
									<div className="bg-gray-50 px-4 py-2 rounded-lg">
										{" "}
										<div className="text-2xl font-bold text-gray-900">
											{profileData.stats.created}
										</div>{" "}
										<div className="text-sm text-gray-500">Comics</div>{" "}
									</div>
									<div className="bg-gray-50 px-4 py-2 rounded-lg">
										{" "}
										<div className="text-2xl font-bold text-gray-900">
											{profileData.stats.favorites}
										</div>{" "}
										<div className="text-sm text-gray-500">Favorites</div>{" "}
									</div>
									<div className="bg-gray-50 px-4 py-2 rounded-lg">
										{" "}
										<div className="text-2xl font-bold text-gray-900">
											{profileData.stats.followers}
										</div>{" "}
										<div className="text-sm text-gray-500">Followers</div>{" "}
									</div>
									<div className="bg-gray-50 px-4 py-2 rounded-lg">
										{" "}
										<div className="text-2xl font-bold text-gray-900">
											{profileData.stats.following}
										</div>{" "}
										<div className="text-sm text-gray-500">Following</div>{" "}
									</div>
								</div>
								<div className="text-sm text-gray-500 pt-2">
									{" "}
									{profileData.joinDate
										? `Joined ${profileData.joinDate}`
										: ""}{" "}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Profile content tabs */}
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

					{/* My Comics Tab */}
					<TabsContent value="comics" className="space-y-6">
						<div className="flex justify-between items-center">
							<h2 className="text-xl font-bold text-gray-900">My Comics</h2>
							{/* Only show Create New if authenticated */}
							{isAuthenticated && (
								<Link
									href="/comics/create"
									className="flex items-center text-blue-600 hover:text-blue-800"
								>
									<PlusCircle size={16} className="mr-1" /> Create New Comic
								</Link>
							)}
						</div>

						{/* Conditional Rendering for Comics List */}
						{(isLoadingAuth || isLoadingComics) && (
							<div className="text-center py-12">
								<Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-500" />
								<p className="mt-2 text-gray-600">Loading...</p>
							</div>
						)}

						{!isLoadingAuth && !isLoadingComics && errorLoadingComics && (
							<div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg">
								<BookOpen size={48} className="mx-auto text-red-400 mb-4" />
								<h3 className="text-lg font-medium text-red-700 mb-2">
									Error Loading Comics
								</h3>
								<p className="text-red-600 mb-4">{errorLoadingComics}</p>
								{/* Optionally add retry or login suggestion */}
							</div>
						)}

						{!isLoadingAuth &&
							!isLoadingComics &&
							!errorLoadingComics &&
							!isAuthenticated && (
								<div className="text-center py-12 bg-gray-50 border rounded-lg">
									<User size={48} className="mx-auto text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Please Log In
									</h3>
									<p className="text-gray-600 mb-4">
										Log in to see your comics and profile.
									</p>
									{/* Add Login Button if using Amplify UI or similar */}
									{/* <Button onClick={() => router.push('/login')}>Log In</Button> */}
								</div>
							)}

						{!isLoadingAuth &&
							!isLoadingComics &&
							!errorLoadingComics &&
							isAuthenticated &&
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
										{" "}
										<Link href="/comics/create"> Get Started </Link>{" "}
									</Button>
								</div>
							)}

						{!isLoadingAuth &&
							!isLoadingComics &&
							!errorLoadingComics &&
							isAuthenticated &&
							myComics.length > 0 && (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									{myComics.map((comic) => (
										<Link
											href={`/comics/${comic.comic_id}`}
											key={comic.comic_id}
										>
											<div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
												{/* Placeholder for Cover Image */}
												<div className="aspect-[3/4] bg-gray-100 relative flex items-center justify-center text-gray-400">
													<ImageIcon size={48} />
												</div>
												<div className="p-4">
													<h3 className="font-medium text-lg text-gray-900 mb-1 truncate">
														{comic.title}
													</h3>
													<div className="flex justify-between text-sm text-gray-500">
														<span>Updated: {formatDate(comic.updated_at)}</span>
														{/* Add likes if available */}
													</div>
												</div>
											</div>
										</Link>
									))}
								</div>
							)}
					</TabsContent>

					{/* Favorites Tab */}
					<TabsContent value="favorites" className="space-y-6">
						{/* Keep mock data or implement fetching similar to 'My Comics' */}
						<h2 className="text-xl font-bold text-gray-900">Favorite Comics</h2>
						{userFavoriteComics.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{userFavoriteComics.map((comic) => (
									<Link href={`/comics/${comic.id}`} key={comic.id}>
										{" "}
										{/* Link to external comics if needed */}
										<div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
											<div className="aspect-[3/4] bg-gray-100 relative">
												<Image
													src={comic.coverImage}
													alt={comic.title}
													fill
													style={{ objectFit: "cover" }}
													sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
												/>
											</div>
											<div className="p-4">
												{" "}
												<h3 className="font-medium text-lg text-gray-900 mb-1">
													{comic.title}
												</h3>{" "}
												<div className="flex justify-between text-sm text-gray-500">
													{" "}
													<span>By: {comic.author}</span>{" "}
													<span className="flex items-center">
														{" "}
														<Heart
															size={14}
															className="mr-1 text-red-500"
														/>{" "}
														{comic.likes}{" "}
													</span>{" "}
												</div>{" "}
											</div>
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className="text-center py-12 bg-white rounded-lg border">
								{" "}
								<Heart size={48} className="mx-auto text-gray-400 mb-4" />{" "}
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									No favorites yet
								</h3>{" "}
								<p className="text-gray-600 mb-4">
									Browse comics and add some!
								</p>{" "}
								<Button asChild>
									{" "}
									<Link href="/comics"> Browse Comics </Link>{" "}
								</Button>{" "}
							</div>
						)}
					</TabsContent>

					{/* Settings Tab */}
					<TabsContent value="settings" className="space-y-6">
						{/* Keep mock settings form or implement saving */}
						<h2 className="text-xl font-bold text-gray-900">
							Account Settings
						</h2>
						{/* Only show settings if authenticated */}
						{isAuthenticated ? (
							<>
								<div className="bg-white shadow overflow-hidden rounded-lg">
									{/* ... Settings form JSX (Personal Info, Contact, Preferences) ... */}
									{/* Example Save Settings Button */}
									<div className="px-4 py-5 border-t border-gray-200 sm:px-6">
										<div className="flex justify-end">
											<Button
												type="button"
												onClick={() => {
													/* TODO: Implement save settings API call */
												}}
											>
												{" "}
												Save Settings{" "}
											</Button>
										</div>
									</div>
								</div>
								{/* Security Settings */}
								<div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
									<div className="px-4 py-5 sm:px-6 border-b">
										{" "}
										<h3 className="text-lg font-medium text-gray-900">
											Security
										</h3>{" "}
									</div>
									<div className="px-4 py-5 sm:p-6">
										{/* Add link/button for change password flow */}
										<Button variant="outline">Change Password</Button>
									</div>
								</div>
								{/* Danger Zone */}
								<div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
									<div className="px-4 py-5 sm:px-6 border-b">
										{" "}
										<h3 className="text-lg font-medium text-red-600">
											Danger Zone
										</h3>{" "}
									</div>
									<div className="px-4 py-5 sm:p-6">
										<Button
											variant="destructive"
											onClick={() => {
												/* TODO: Implement delete account flow */
											}}
										>
											{" "}
											Delete Account{" "}
										</Button>
										<p className="mt-2 text-sm text-gray-500">
											{" "}
											Once you delete your account, there is no going back.
											Please be certain.{" "}
										</p>
									</div>
								</div>
							</>
						) : (
							<div className="text-center py-12 bg-gray-50 border rounded-lg">
								<Settings size={48} className="mx-auto text-gray-400 mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									Please Log In
								</h3>
								<p className="text-gray-600 mb-4">
									Log in to manage your settings.
								</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
