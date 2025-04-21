'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heart, Share2, Download, Flag, Edit, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Comic {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  description: string;
  panels: {
    id: string;
    imageUrl: string;
  }[];
  createdAt: string;
  likes: number;
  views: number;
  isLiked: boolean;
  isAuthor: boolean;
}

export default function ComicPage({ params }: { params: { id: string } }) {
  const [comic, setComic] = useState<Comic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchComic(params.id);
  }, [params.id]);
  
  const fetchComic = async (comicId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Placeholder API call
      // In a real implementation, this would call your backend API
      const response = await mockFetchComic(comicId);
      setComic(response);
    } catch (error) {
      console.error('Failed to fetch comic:', error);
      setError('Failed to load comic');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Placeholder function for API call
  const mockFetchComic = async (comicId: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
    const panelCount = Math.floor(Math.random() * 6) + 2;
    
    return {
      id: comicId,
      title: `Comic #${comicId}`,
      author: {
        id: 'user-1',
        name: 'John Doe',
        avatar: '/api/placeholder/50/50?text=JD'
      },
      description: 'This is a sample comic description. The creator has put a lot of effort into making this comic. Enjoy!',
      panels: Array(panelCount).fill(null).map((_, i) => ({
        id: `panel-${i}`,
        imageUrl: `/api/placeholder/600/600?text=Panel+${i + 1}`
      })),
      createdAt: new Date().toISOString(),
      likes: Math.floor(Math.random() * 100),
      views: Math.floor(Math.random() * 1000),
      isLiked: Math.random() > 0.5,
      isAuthor: Math.random() > 0.7
    };
  };
  
  // Toggle like
  const toggleLike = async () => {
    if (!comic) return;
    
    // Optimistic update
    setComic({
      ...comic,
      isLiked: !comic.isLiked,
      likes: comic.isLiked ? comic.likes - 1 : comic.likes + 1
    });
    
    try {
      // Placeholder API call
      // In a real implementation, this would call your backend API
      await mockToggleLike(comic.id, !comic.isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      
      // Revert on error
      setComic({
        ...comic,
        isLiked: comic.isLiked,
        likes: comic.isLiked ? comic.likes : comic.likes - 1
      });
    }
  };
  
  // Placeholder function for API call
  const mockToggleLike = async (comicId: string, liked: boolean) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Just return success
    return { success: true };
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || !comic) {
    return notFound();
  }
  
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
                <img 
                  src={comic.author.avatar} 
                  alt={comic.author.name}
                  className="w-6 h-6 rounded-full mr-2" 
                />
                <span className="text-sm text-gray-600">
                  By <Link href={`/profile/${comic.author.id}`} className="text-blue-600 hover:underline">{comic.author.name}</Link>
                </span>
                <span className="text-sm text-gray-400 mx-2">•</span>
                <span className="text-sm text-gray-600">{formatDate(comic.createdAt)}</span>
              </div>
            </div>
            
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
              <div key={panel.id} className="mb-4 border border-gray-200">
                <img 
                  src={panel.imageUrl} 
                  alt={`Panel ${index + 1}`}
                  className="w-full h-auto" 
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Comic footer */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span>{comic.views} views</span>
              <span className="mx-2">•</span>
              <span>{comic.likes} likes</span>
            </div>
            
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
              <img 
                src={comic.author.avatar} 
                alt={comic.author.name}
                className="w-12 h-12 rounded-full mr-4" 
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