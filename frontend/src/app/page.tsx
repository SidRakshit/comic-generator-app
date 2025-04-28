'use client';

import Link from 'next/link';
// Import Image and useCallback
import Image from 'next/image'; 
import { useState, useEffect, useCallback } from 'react'; 
import { ChevronRight, Book, Wand2, Users, Brush } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturedComic {
  id: string;
  title: string;
  author: string;
  coverImage: string;
}

export default function HomePage() {
  const [featuredComics, setFeaturedComics] = useState<FeaturedComic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Wrap fetchFeaturedComics in useCallback
  const fetchFeaturedComics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await mockFetchFeaturedComics();
      setFeaturedComics(response);
    } catch (error) {
      console.error('Failed to fetch featured comics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchFeaturedComics();
  }, [fetchFeaturedComics]); 

  // Placeholder function for API call (remains the same)
  const mockFetchFeaturedComics = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Array(4).fill(null).map((_, i) => ({
      id: `comic-${i + 1}`,
      title: `Comic #${i + 1}`,
      author: `User ${i % 3 + 1}`,
      coverImage: `/api/placeholder/400/500?text=Comic+${i + 1}`
    }));
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4"> <div className="max-w-3xl mx-auto text-center"> <h1 className="text-4xl sm:text-5xl font-bold mb-6"> Create Amazing Comics with AI </h1> <p className="text-xl mb-8"> Turn your ideas into visual stories with our easy-to-use comic creation platform. No artistic skills required! </p> <div className="flex flex-wrap justify-center gap-4"> <Button size="lg" asChild className="bg-white text-blue-700 hover:bg-gray-100"> <Link href="/comics/create"> Create Your First Comic </Link> </Button> <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-blue-700"> <Link href="/comics"> Browse Comics </Link> </Button> </div> </div> </div>
      </section>

      <section className="py-16">
         <div className="container mx-auto px-4"> <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> <div className="bg-white p-6 rounded-lg shadow text-center"> <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4"> <Book className="h-6 w-6" /> </div> <h3 className="text-xl font-semibold mb-2">Choose a Template</h3> <p className="text-gray-600"> Select from various comic layouts with different panel arrangements. </p> </div> <div className="bg-white p-6 rounded-lg shadow text-center"> <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4"> <Wand2 className="h-6 w-6" /> </div> <h3 className="text-xl font-semibold mb-2">Describe Each Panel</h3> <p className="text-gray-600"> Enter a text prompt for each panel and our AI will generate the perfect image. </p> </div> <div className="bg-white p-6 rounded-lg shadow text-center"> <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4"> <Brush className="h-6 w-6" /> </div> <h3 className="text-xl font-semibold mb-2">Customize</h3> <p className="text-gray-600"> Add speech bubbles, captions, and customize your comic to tell your story. </p> </div> <div className="bg-white p-6 rounded-lg shadow text-center"> <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4"> <Users className="h-6 w-6" /> </div> <h3 className="text-xl font-semibold mb-2">Share</h3> <p className="text-gray-600"> Publish your comic for others to see or download it for personal use. </p> </div> </div> </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-center mb-8"> <h2 className="text-3xl font-bold">Featured Comics</h2> <Link href="/comics?category=featured" className="text-blue-600 hover:text-blue-800 inline-flex items-center" > View all <ChevronRight className="h-4 w-4 ml-1" /> </Link> </div>
          
          {isLoading ? (
             <div className="flex justify-center items-center h-64"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div> </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredComics.map(comic => (
                <Link href={`/comics/${comic.id}`} key={comic.id}>
                  <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-[3/4] bg-gray-100 relative">
                      <Image
                        src={comic.coverImage}
                        alt={comic.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-4"> <h3 className="font-medium text-lg text-gray-900 mb-1">{comic.title}</h3> <p className="text-sm text-gray-500">By {comic.author}</p> </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
                    <div className="text-center mt-12"> <Button asChild> <Link href="/comics/create"> Create Your Own Comic </Link> </Button> </div>
        </div>
      </section>

      <section className="py-16 bg-blue-900 text-white">
         <div className="container mx-auto px-4 text-center"> <h2 className="text-3xl font-bold mb-4">Ready to Create Your Comic?</h2> <p className="text-xl mb-8 max-w-2xl mx-auto"> Join thousands of creators who are bringing their stories to life. No artistic skills needed! </p> <Button size="lg" asChild className="bg-white text-blue-900 hover:bg-gray-100"> <Link href="/comics/create"> Get Started Now </Link> </Button> </div>
      </section>
    </div>
  );
}