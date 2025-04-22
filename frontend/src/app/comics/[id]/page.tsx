'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component
import { notFound } from 'next/navigation';
import { Heart, Share2, Download, Flag, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ... (Keep the Comic and PageParams interfaces as they were) ...
interface Comic {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatar: string; // e.g., /api/placeholder/50/50?text=JD
  };
  description: string;
  panels: {
    id: string;
    imageUrl: string; // e.g., /api/placeholder/600/600?text=Panel+1
  }[];
  createdAt: string;
  likes: number;
  views: number;
  isLiked: boolean;
  isAuthor: boolean;
}

interface PageParams {
  id: string;
}


export default function ComicPage({ params }: { params: Promise<PageParams> }) {
  const awaitedParams = use(params);
  const id = awaitedParams.id; 

  const [comic, setComic] = useState<Comic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchComic = useCallback(async (comicId: string) => {
    // ... (fetchComic implementation remains the same) ...
    setIsLoading(true);
    setError(null);
    try {
      const response = await mockFetchComic(comicId);
      setComic(response);
    } catch (error) {
      console.error('Failed to fetch comic:', error);
      setError('Failed to load comic');
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    // ... (useEffect remains the same) ...
     if (id) {
      fetchComic(id);
    }
  }, [id, fetchComic]); 
  
  // ... (mockFetchComic, toggleLike, mockToggleLike, formatDate remain the same) ...
  const mockFetchComic = async (comicId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const panelCount = Math.floor(Math.random() * 6) + 2;
    return {
      id: comicId,
      title: `Comic #${comicId}`,
      author: { id: 'user-1', name: 'John Doe', avatar: `/api/placeholder/50/50?text=JD` },
      description: 'This is a sample comic description. Enjoy!',
      panels: Array(panelCount).fill(null).map((_, i) => ({ id: `panel-${i}`, imageUrl: `/api/placeholder/600/600?text=Panel+${i + 1}` })),
      createdAt: new Date().toISOString(),
      likes: Math.floor(Math.random() * 100),
      views: Math.floor(Math.random() * 1000),
      isLiked: Math.random() > 0.5,
      isAuthor: Math.random() > 0.7
    };
  };
  const toggleLike = async () => {
    if (!comic) return;
    setComic({ ...comic, isLiked: !comic.isLiked, likes: comic.isLiked ? comic.likes - 1 : comic.likes + 1 });
    try {
      await mockToggleLike(comic.id, !comic.isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setComic({ ...comic, isLiked: comic.isLiked, likes: comic.isLiked ? comic.likes : comic.likes - 1 });
    }
  };
  const mockToggleLike = async (comicId: string, liked: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };


  // ... (Conditional rendering for loading/error states remains the same) ...
  if (isLoading && !comic) { 
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  if (error) { 
     return notFound(); 
  }
  if (!comic) { 
      return notFound();
  }
  
  // Main component JSX with <Image> replacements
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link 
          href="/comics" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Comics
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Comic header */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{comic.title}</h1>
              <div className="flex items-center mt-2">
                {/* Replaced img with Image */}
                <Image 
                  src={comic.author.avatar} 
                  alt={comic.author.name} 
                  width={24} // Corresponds to w-6, h-6 (assuming 1rem=16px, 1.5rem=24px)
                  height={24}
                  className="rounded-full mr-2" 
                />
                <span className="text-sm text-gray-600">
                  By <Link href={`/profile/${comic.author.id}`} className="text-blue-600 hover:underline">{comic.author.name}</Link>
                </span>
                <span className="text-sm text-gray-400 mx-2">•</span>
                <span className="text-sm text-gray-600">{formatDate(comic.createdAt)}</span>
              </div>
            </div>
            {/* ... (Action buttons remain the same) ... */}
             <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <Button 
                variant={comic.isLiked ? "default" : "outline"} 
                size="sm"
                onClick={toggleLike}
              >
                <Heart className={`h-4 w-4 mr-1 ${comic.isLiked ? 'fill-current' : ''}`} />
                {comic.likes}
              </Button>
              
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              {comic.isAuthor && (
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          
          {comic.description && (
            <p className="mt-4 text-gray-600">{comic.description}</p>
          )}
        </div>
        
        {/* Comic content */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            {comic.panels.map((panel, index) => (
              <div key={panel.id} className="mb-4 border border-gray-200 relative" style={{ width: '100%', aspectRatio: '1 / 1' }}> {/* Added relative and aspect ratio for Image fill */}
                {/* Replaced img with Image */}
                {/* Using fill requires the parent to have position relative and defined dimensions or aspect ratio */}
                <Image 
                  src={panel.imageUrl} 
                  alt={`Panel ${index + 1}`} 
                  fill // Use fill layout
                  style={{ objectFit: 'cover' }} // Maintain aspect ratio coverage
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px" // Optional: Optimize image loading based on viewport
                  priority={index < 2} // Optional: Prioritize loading the first few images
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Comic footer */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center">
            {/* ... (Views/Likes remain the same) ... */}
            <div className="text-sm text-gray-500">
              <span>{comic.views} views</span>
              <span className="mx-2">•</span>
              <span>{comic.likes} likes</span>
            </div>
            
            {/* ... (Download/Report buttons remain the same) ... */}
             <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4 mr-1" />
                Report
              </Button>
            </div>
          </div>
          
          {/* Author info */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center">
               {/* Replaced img with Image */}
              <Image 
                src={comic.author.avatar} 
                alt={`${comic.author.name} avatar`} 
                width={48} // Corresponds to w-12, h-12 (assuming 1rem=16px, 3rem=48px)
                height={48}
                className="rounded-full mr-4" 
              />
              <div>
                <h3 className="text-lg font-medium">{comic.author.name}</h3>
                <Link 
                  href={`/profile/${comic.author.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}