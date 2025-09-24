// src/components/home/featured-comics-section.tsx
"use client"; // Add this if you uncomment the data fetching logic

// Imports needed when uncommented:
// import Link from "next/link";
// import Image from "next/image";
// import { useState, useEffect, useCallback } from "react";
// import { ChevronRight } from "lucide-react";
// import ComicCard from "./comic-card"; // Assuming you create this
// import { Button } from "@repo/ui/button";

// Interface needed when uncommented:
// interface FeaturedComic {
//  id: string;
//  title: string;
//  author: string;
//  coverImage: string;
// }

export default function FeaturedComicsSection() {
	// --- Data Fetching Logic (Move from page.tsx here when uncommented) ---
	// const [featuredComics, setFeaturedComics] = useState<FeaturedComic[]>([]);
	// const [isLoading, setIsLoading] = useState(true);
	//
	// const fetchFeaturedComics = useCallback(async () => {
	//   setIsLoading(true);
	//   try {
	//     // Replace mockFetchFeaturedComics with your actual API call
	//     const response = await mockFetchFeaturedComics();
	//     setFeaturedComics(response);
	//   } catch (error) {
	//     console.error("Failed to fetch featured comics:", error);
	//   } finally {
	//     setIsLoading(false);
	//   }
	// }, []);
	//
	// useEffect(() => {
	//   fetchFeaturedComics();
	// }, [fetchFeaturedComics]);
	//
	// const mockFetchFeaturedComics = async () => {
	//   await new Promise(resolve => setTimeout(resolve, 1000));
	//   return Array(4).fill(null).map((_, i) => ({
	//     id: `comic-${i + 1}`,
	//     title: `Comic #${i + 1}`,
	//     author: `User ${(i % 3) + 1}`,
	//     coverImage: `/api/placeholder/400/500?text=Comic+${i + 1}`,
	//   }));
	// };
	// --- End of Data Fetching Logic ---

	// Placeholder content until the section is implemented
	return (
		<section className="py-16 bg-gray-50 hidden">
			{" "}
			{/* Hidden for now */}
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h2 className="text-3xl font-bold">Featured Comics</h2>
					{/* <Link href="/comics?category=featured" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Link> */}
				</div>
				{/* --- Conditional Rendering (Use when uncommented) ---
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredComics.map(comic => (
              <ComicCard key={comic.id} comic={comic} /> // Use ComicCard component
            ))}
          </div>
        )}
        */}
				{/* --- CTA Button (Use when uncommented) ---
        <div className="text-center mt-12">
          <Button asChild>
            <Link href="/comics/create">Create Your Own Comic</Link>
          </Button>
        </div>
         */}
				<p className="text-center text-gray-500">(Featured Comics Section)</p>{" "}
				{/* Placeholder text */}
			</div>
		</section>
	);
}
