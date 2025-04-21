'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ComicsLayout from '@/components/layouts/ComicsLayout';

interface Comic {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  createdAt: string;
  panels: number;
  likes: number;
}

export default function ComicsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const viewMode = searchParams.get('view') || 'grid';
  
  const [comics, setComics] = useState<Comic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>(viewMode === 'list' ? 'list' : 'grid');
  
  useEffect(() => {
    // Fetch comics based on category
    fetchComics(category);
  }, [category]);
  
  const fetchComics = async (categoryFilter: string) => {
    setIsLoading(true);
    
    try {
      // Placeholder API call
      // In a real implementation, this would call your backend API
      const response = await mockFetchComics(categoryFilter);
      setComics(response);
    } catch (error) {
      console.error('Failed to fetch comics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Placeholder function for API call
  const mockFetchComics = async (categoryFilter: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
    return Array(12).fill(null).map((_, i) => ({
      id: `comic-${i + 1}`,
      title: `Comic #${i + 1}`,
      author: `User ${i % 5 + 1}`,
      coverImage: `/api/placeholder/300/400?text=Comic+${i + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      panels: Math.floor(Math.random() * 8) + 1,
      likes: Math.floor(Math.random() * 100)
    }));
  };
  
  // Filter comics based on search query
  const filteredComics = comics.filter(comic => 
    comic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comic.author.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <ComicsLayout currentPath="/comics">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {category === 'featured' ? 'Featured Comics' : 
             category === 'latest' ? 'Latest Comics' : 'All Comics'}
          </h1>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search comics..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex">
              <Button
                variant={displayMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setDisplayMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={displayMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setDisplayMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredComics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No comics found matching your search.</p>
          </div>
        ) : displayMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredComics.map(comic => (
              <Link href={`/comics/${comic.id}`} key={comic.id}>
                <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] bg-gray-100 relative">
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 truncate">{comic.title}</h3>
                    <p className="text-sm text-gray-500">By {comic.author}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                      <span>{formatDate(comic.createdAt)}</span>
                      <span>{comic.panels} panels</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {filteredComics.map(comic => (
              <Link href={`/comics/${comic.id}`} key={comic.id}>
                <div className="flex py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-24 bg-gray-100 shrink-0">
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-gray-900">{comic.title}</h3>
                    <p className="text-sm text-gray-500">By {comic.author}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                      <span>{formatDate(comic.createdAt)}</span>
                      <span>{comic.panels} panels • {comic.likes} likes</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ComicsLayout>
  );
}