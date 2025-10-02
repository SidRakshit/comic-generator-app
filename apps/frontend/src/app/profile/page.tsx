// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Button } from "@repo/ui/button";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { ComicListItemResponse, API_ENDPOINTS, SEMANTIC_COLORS, INTERACTIVE_STYLES, COMPONENT_STYLES, UI_CONSTANTS, DeleteAccountRequest } from "@repo/common-types";
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

// Initial user data structure (consider fetching this too if needed)
const initialUserData = {
	name: "Click here to edit your name",
	bio: "Click here to edit your bio",
	avatarUrl: `${API_ENDPOINTS.PLACEHOLDER_IMAGE}?width=150&height=150`,
	joinDate: "",
	email: "",
	website: "",
	twitter: "",
	stats: { created: 0, favorites: 0 },
};

export default function ProfilePage() {
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	// Consider fetching profileData instead of using only initialUserData
	const [profileData, setProfileData] = useState(initialUserData);

	// State for fetched comics
	const [myComics, setMyComics] = useState<ComicListItemResponse[]>([]);
	const [isLoadingComics, setIsLoadingComics] = useState(true); // Track comic loading
	const [errorLoadingComics, setErrorLoadingComics] = useState<string | null>(
		null
	);

	const [userFavoriteComics, setUserFavoriteComics] = useState<any[]>([]);
	const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
	const [creditBalance, setCreditBalance] = useState(0);

	// Delete account state
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);

	// Get auth state from context
	const {
		user,
		isLoading: isLoadingAuth,
		attributes,
		error: authError,
		handleSignOut,
	} = useAuth();
	const isAuthenticated = !!user && !isLoadingAuth;

	// Update profile data from context once auth loads (optional)
	useEffect(() => {
		if (!isLoadingAuth && isAuthenticated && user) {
			setProfileData((prev) => ({
				...prev,
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
					const data = await apiRequest<ComicListItemResponse[]>(API_ENDPOINTS.COMICS, "GET");
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

	useEffect(() => {
		if (isAuthenticated) {
			const fetchFavorites = async () => {
				setIsLoadingFavorites(true);
				try {
					const data = await apiRequest<any[]>(API_ENDPOINTS.FAVORITES, "GET");
					setUserFavoriteComics(data || []);
				} catch (err: unknown) {
					console.error("Failed to fetch user favorites:", err);
				} finally {
					setIsLoadingFavorites(false);
				}
			};
			fetchFavorites();
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (isAuthenticated) {
			const fetchCredits = async () => {
				try {
					const data = await apiRequest<{ panel_balance: number }>(API_ENDPOINTS.USER_CREDITS_ME, "GET");
					setCreditBalance(data?.panel_balance || 0);
				} catch (err: unknown) {
					console.error("Failed to fetch user credits:", err);
				}
			};
			fetchCredits();
		}
	}, [isAuthenticated]);

	const toggleFavorite = async (comicId: string) => {
		const isFavorite = userFavoriteComics.some((comic) => comic.comic_id === comicId);
		if (isFavorite) {
			await apiRequest(API_ENDPOINTS.FAVORITE_BY_ID(comicId), "DELETE");
			setUserFavoriteComics(userFavoriteComics.filter((comic) => comic.comic_id !== comicId));
		} else {
			await apiRequest(API_ENDPOINTS.FAVORITES, "POST", { comicId });
			// Ideally, the API would return the newly favorited comic
			// For now, we just refetch the list
			const data = await apiRequest<any[]>(API_ENDPOINTS.FAVORITES, "GET");
			setUserFavoriteComics(data || []);
		}
	};

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

	// Delete account handlers
	const handleDeleteAccount = async () => {
		if (deleteConfirmationText !== "DELETE") {
			alert("Please type 'DELETE' to confirm account deletion.");
			return;
		}

		setIsDeletingAccount(true);
		try {
			const deleteRequest: DeleteAccountRequest = {
				confirmation: deleteConfirmationText,
			};

			await apiRequest(API_ENDPOINTS.USER_DELETE_ACCOUNT, "DELETE", deleteRequest);
			
			// Account successfully deleted, sign out and redirect
			await handleSignOut();
		} catch (error) {
			console.error("Failed to delete account:", error);
			alert("Failed to delete account. Please try again.");
		} finally {
			setIsDeletingAccount(false);
			setShowDeleteConfirmation(false);
			setDeleteConfirmationText("");
		}
	};

	const handleCancelDelete = () => {
		setShowDeleteConfirmation(false);
		setDeleteConfirmationText("");
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
		<div className={`min-h-screen ${SEMANTIC_COLORS.BACKGROUND.SECONDARY} pb-12`}>
			{/* Profile header */}
			<div className={`${SEMANTIC_COLORS.BACKGROUND.SECONDARY} shadow`}>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Basic loading state for header */}
					{isLoadingAuth ? (
						<div className="flex justify-center items-center h-40">
							<Loader2 className={`h-8 w-8 animate-spin ${SEMANTIC_COLORS.TEXT.DISABLED}`} />
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
									className={`${UI_CONSTANTS.BORDER_RADIUS.FULL} object-cover border-4 ${SEMANTIC_COLORS.BORDER.INVERTED} shadow`}
									priority // Prioritize loading avatar image
								/>
								{isEditingProfile && (
									<button className={`absolute bottom-0 right-0 ${INTERACTIVE_STYLES.BUTTON.PRIMARY} rounded-full p-2 shadow-md`}>
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

											<label className="block text-sm font-medium text-gray-700">
												Display Name
											</label>
											<input
												type="text"
												value={profileData.name}
												onChange={(e) =>
													setProfileData({
														...profileData,
														name: e.target.value,
													})
												}
												// only when it is Comic Creator set the value to empty
												onFocus={(e) => {
													if (e.target.value === "Click here to edit your name") {
														setProfileData({
															...profileData,
															name: "",
														});
													}
												}}
													className={`${COMPONENT_STYLES.FORM.INPUT} ${SEMANTIC_COLORS.TEXT.DISABLED} ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${
													profileData.name && profileData.name !== "Click here to edit your name" 
														? SEMANTIC_COLORS.TEXT.PRIMARY 
														: ""
												}`}
											/>
										</div>
										<div>

											<label className="block text-sm font-medium text-gray-700 ">
												Bio
											</label>
											<textarea
												value={profileData.bio}
												onChange={(e) =>
													setProfileData({
														...profileData,
														bio: e.target.value,
													})
												}
												// only when it is "Click here to edit your bio set the value to empty
												onFocus={(e) => {
													if (e.target.value === "Click here to edit your bio") {
														setProfileData({
															...profileData,
															bio: "",
														});
													}
												}}
												rows={3}
												className={`${COMPONENT_STYLES.FORM.INPUT} ${SEMANTIC_COLORS.TEXT.DISABLED} ${SEMANTIC_COLORS.BACKGROUND.PRIMARY}  ${
													profileData.bio && profileData.bio !== "Click here to edit your bio" 
														? SEMANTIC_COLORS.TEXT.PRIMARY 
														: ""
												}`}
											/>
										</div>
									</div>
								) : (
									<>
										<h1 className="text-2xl font-bold text-gray-900">
											{profileData.name}
										</h1>
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
													className="flex items-center bg-black text-white border border-gray-300 hover:bg-gray-800"
												>

													<Save size={16} className="mr-1" /> Save Changes
												</Button>
												<Button
													variant="outline"
													onClick={handleCancelEditProfile}
												>

													Cancel
												</Button>
											</>
										) : (
											<>
												<Button
													variant="outline"
													className="flex items-center"
													onClick={() => setIsEditingProfile(true)}
												>

													<Edit size={16} className="mr-1" /> Edit Profile
												</Button>
												<Button asChild variant="outline">
													<Link href="/billing" className="flex items-center">
														<PlusCircle size={16} className="mr-1" /> Buy Credits
													</Link>
												</Button>
											</>
										)}
									</div>
								)}
							</div>

							{/* Stats */}
							<div className="mt-6 md:mt-0 flex flex-col items-center md:items-end space-y-2 w-full md:w-auto">
								<div className="grid grid-cols-3 gap-4 text-center">
									<div className={`${SEMANTIC_COLORS.BACKGROUND.SECONDARY} px-4 py-2 ${UI_CONSTANTS.BORDER_RADIUS.LARGE}`}>
										<div className="text-2xl font-bold text-gray-900">
											{creditBalance}
										</div>
										<div className="text-sm text-gray-500">Credits</div>
									</div>
									<div className={`${SEMANTIC_COLORS.BACKGROUND.SECONDARY} px-4 py-2 ${UI_CONSTANTS.BORDER_RADIUS.LARGE}`}>

										<div className="text-2xl font-bold text-gray-900">
											{profileData.stats.created}
										</div>
										<div className="text-sm text-gray-500">Comics</div>
									</div>
									<div className={`${SEMANTIC_COLORS.BACKGROUND.SECONDARY} px-4 py-2 ${UI_CONSTANTS.BORDER_RADIUS.LARGE}`}>

										<div className="text-2xl font-bold text-gray-900">
											{userFavoriteComics.length}
										</div>
										<div className="text-sm text-gray-500">Favorites</div>
									</div>
								</div>
								<div className="text-sm text-gray-500 pt-2">

									{profileData.joinDate
										? `Joined ${profileData.joinDate}`
										: ""}
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
						<TabsTrigger value="comics" className="flex items-center data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:border data-[state=inactive]:border-gray-300 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600">
							{" "}
							<BookOpen size={16} className="mr-1" /> My Comics{" "}
						</TabsTrigger>
						<TabsTrigger value="favorites" className="flex items-center data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:border data-[state=inactive]:border-gray-300 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600">
							{" "}
							<Heart size={16} className="mr-1" /> Favorites{" "}
						</TabsTrigger>
						<TabsTrigger value="settings" className="flex items-center data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:border data-[state=inactive]:border-gray-300 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600">
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
									className={`flex items-center ${INTERACTIVE_STYLES.LINK.PRIMARY}`}
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
							<div className="text-center py-12 bg-red-50 border border-red-200 ${UI_CONSTANTS.BORDER_RADIUS.LARGE}">
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
								<div className={`text-center py-12 ${SEMANTIC_COLORS.BACKGROUND.SECONDARY} ${SEMANTIC_COLORS.BORDER.DEFAULT} ${UI_CONSTANTS.BORDER_RADIUS.LARGE}`}>
									<User size={48} className="mx-auto text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Please Log In
									</h3>
									<p className={`${SEMANTIC_COLORS.TEXT.TERTIARY} mb-4`}>
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
								<div className="text-center py-12 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} border">
									<BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										No comics yet
									</h3>
									<p className={`${SEMANTIC_COLORS.TEXT.TERTIARY} mb-4`}>
										Start creating your first comic!
									</p>
									<Button asChild>
										<Link href="/comics/create">Get Started</Link>
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
										<div key={comic.comic_id} className="relative">
											<Link
												href={`/comics/${comic.comic_id}`}
											>
												<div className="${SEMANTIC_COLORS.BACKGROUND.PRIMARY} border ${UI_CONSTANTS.BORDER_RADIUS.LARGE} overflow-hidden shadow-sm hover:shadow-md transition-shadow">
													{/* Placeholder for Cover Image */}
													<div className={`${UI_CONSTANTS.ASPECT_RATIOS.COMIC_COVER} ${SEMANTIC_COLORS.BACKGROUND.TERTIARY} relative flex items-center justify-center ${SEMANTIC_COLORS.TEXT.DISABLED}`}>
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
											<Button
												variant="outline"
												className="absolute top-2 right-2"
												onClick={() => toggleFavorite(comic.comic_id)}
											>
												<Heart size={16} className={`${userFavoriteComics.some((fav) => fav.comic_id === comic.comic_id) ? "fill-red-500" : ""}`} />
											</Button>
										</div>
									))}
								</div>
							)}
					</TabsContent>

					{/* Favorites Tab */}
					<TabsContent value="favorites" className="space-y-6">
						{/* Keep mock data or implement fetching similar to 'My Comics' */}
						<h2 className="text-xl font-bold text-gray-900">Favorite Comics</h2>
						{isLoadingFavorites ? (
							<div className="text-center py-12">
								<Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-500" />
								<p className="mt-2 text-gray-600">Loading...</p>
							</div>
						) : userFavoriteComics.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{userFavoriteComics.map((fav) => (
									<Link href={`/comics/${fav.comic.comic_id}`} key={fav.comic.comic_id}>
										<div className="${SEMANTIC_COLORS.BACKGROUND.PRIMARY} border ${UI_CONSTANTS.BORDER_RADIUS.LARGE} overflow-hidden shadow-sm hover:shadow-md transition-shadow">
											<div className={`${UI_CONSTANTS.ASPECT_RATIOS.COMIC_COVER} ${SEMANTIC_COLORS.BACKGROUND.TERTIARY} relative`}>
												<Image
													src={
														fav.comic.coverImage ||
														API_ENDPOINTS.PLACEHOLDER_IMAGE_WITH_SIZE(300, 400, '?text=Comic')
													}
													alt={fav.comic.title}
													fill
													style={{ objectFit: "cover" }}
													sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
												/>
											</div>
											<div className="p-4">
												<h3 className="font-medium text-lg text-gray-900 mb-1">
													{fav.comic.title}
												</h3>
												<div className="flex justify-between text-sm text-gray-500">
													<span>By: {fav.comic.author}</span>
													<span className="flex items-center">
														<Heart
															size={14}
															className="mr-1 text-red-500"
														/>
														{fav.comic.likes}
													</span>
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className="text-center py-12 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} ${UI_CONSTANTS.BORDER_RADIUS.LARGE} border">
								<Heart size={48} className="mx-auto text-gray-400 mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									No favorites yet
								</h3>
								<p className={`${SEMANTIC_COLORS.TEXT.TERTIARY} mb-4`}>
									Browse comics and add some!
								</p>
								<Button asChild>
									<Link href="/comics">Browse Comics</Link>
								</Button>
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
								{/* Security Settings */}
								<div className="mt-4 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} shadow overflow-hidden ${UI_CONSTANTS.BORDER_RADIUS.LARGE}">
									<div className="px-4 py-5 sm:px-6 border-b">

										<h3 className="text-lg font-medium text-gray-900">
											Security
										</h3>
									</div>
									<div className="px-4 py-5 sm:p-6">
										{/* Add link/button for change password flow */}
										<Button variant="outline">Change Password</Button>
									</div>
								</div>
								{/* Danger Zone */}
								<div className="mt-4 ${SEMANTIC_COLORS.BACKGROUND.PRIMARY} shadow overflow-hidden ${UI_CONSTANTS.BORDER_RADIUS.LARGE}">
									<div className="px-4 py-5 sm:px-6 border-b">

										<h3 className="text-lg font-medium text-red-600">
											Danger Zone
										</h3>
									</div>
									<div className="px-4 py-5 sm:p-6">
										{!showDeleteConfirmation ? (
											<>
												<Button
													variant="destructive"
													onClick={() => setShowDeleteConfirmation(true)}
													disabled={isDeletingAccount}
													className="bg-gray-100 text-red-600 hover:bg-gray-200 border border-red-300"
												>
													{isDeletingAccount ? "Deleting..." : "Delete Account"}
												</Button>
												<p className="mt-2 text-sm text-gray-500">
													Once you delete your account, there is no going back.
													Please be certain.
												</p>
											</>
										) : (
											<div className="space-y-4">
												<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
													<h4 className="text-lg font-medium text-red-800 mb-2">
														⚠️ Delete Account Confirmation
													</h4>
													<p className="text-sm text-red-700 mb-4">
														This action cannot be undone. This will permanently delete your account,
														all your comics, favorites, and data. You will be logged out immediately.
													</p>
													<div className="space-y-3">
														<label className="block text-sm font-medium text-red-800">
															Type <strong>DELETE</strong> to confirm:
														</label>
														<input
															type="text"
															value={deleteConfirmationText}
															onChange={(e) => setDeleteConfirmationText(e.target.value)}
															placeholder="Type DELETE here"
															className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
														/>
													</div>
												</div>
												<div className="flex space-x-3">
													<Button
														variant="destructive"
														onClick={handleDeleteAccount}
														disabled={isDeletingAccount || deleteConfirmationText !== "DELETE"}
														className="bg-gray-100 text-red-600 hover:bg-gray-200 border border-red-300"
													>
														{isDeletingAccount ? "Deleting Account..." : "Yes, Delete My Account"}
													</Button>
													<Button
														variant="outline"
														onClick={handleCancelDelete}
														disabled={isDeletingAccount}
													>
														Cancel
													</Button>
												</div>
											</div>
										)}
									</div>
								</div>
							</>
						) : (
							<div className={`text-center py-12 ${SEMANTIC_COLORS.BACKGROUND.SECONDARY} ${SEMANTIC_COLORS.BORDER.DEFAULT} ${UI_CONSTANTS.BORDER_RADIUS.LARGE}`}>
								<Settings size={48} className="mx-auto text-gray-400 mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									Please Log In
								</h3>
								<p className={`${SEMANTIC_COLORS.TEXT.TERTIARY} mb-4`}>
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
