'use client';

// Import Suspense, useCallback, and Image
import { useState, useEffect, Suspense, useCallback } from 'react'; 
import Image from 'next/image'; // Import Image
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ComicsLayout from '@/components/layouts/comics-layout';

// ... (Keep the Comic interface and LoadingFallback component as they were) ...
interface Comic {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  createdAt: string;
  panels: number;
  likes: number;
}

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}


function ComicsPageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const viewMode = searchParams.get('view') || 'grid';
  
  const [comics, setComics] = useState<Comic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>(viewMode === 'list' ? 'list' : 'grid');
  
  const fetchComics = useCallback(async (categoryFilter: string) => {
    // ... (fetchComics implementation remains the same) ...
    setIsLoading(true);
    try {
      const response = await mockFetchComics(categoryFilter);
      setComics(response);
    } catch (error) {
      console.error('Failed to fetch comics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    // ... (useEffect remains the same) ...
    fetchComics(category);
  }, [category, fetchComics]); 
  
  // ... (mockFetchComics, filteredComics, formatDate remain the same) ...
   const mockFetchComics = async (categoryFilter: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
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
  const filteredComics = comics.filter(comic => 
    comic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comic.author.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  

  return (
    <ComicsLayout currentPath="/comics">
      <div className="bg-white rounded-lg shadow p-6">
        {/* ... (Header section remains the same) ... */}
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
              <Button variant={displayMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setDisplayMode('grid')} className="rounded-r-none"> <Grid className="h-4 w-4" /> </Button>
              <Button variant={displayMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setDisplayMode('list')} className="rounded-l-none"> <List className="h-4 w-4" /> </Button>
            </div>
          </div>
        </div>

        
        {isLoading ? (
          <LoadingFallback /> 
        ) : filteredComics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No comics found matching your search.</p>
          </div>
        ) : displayMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredComics.map(comic => (
              <Link href={`/comics/${comic.id}`} key={comic.id}>
                <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Added relative for Image fill */}
                  <div className="aspect-[3/4] bg-gray-100 relative"> 
                    {/* Replaced img with Image */}
                    <Image
                      src={comic.coverImage}
                      alt={comic.title} 
                      fill // Use fill layout
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Optimize loading
                    />
                  </div>
                  {/* ... (Rest of grid item info remains the same) ... */}
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
          // List View
          <div className="divide-y">
            {filteredComics.map(comic => (
              <Link href={`/comics/${comic.id}`} key={comic.id}>
                <div className="flex py-4 hover:bg-gray-50 transition-colors">
                  {/* Container for fixed size Image */}
                  <div className="w-20 h-24 bg-gray-100 shrink-0 relative"> 
                     {/* Replaced img with Image */}
                    <Image
                      src={comic.coverImage}
                      alt={comic.title} 
                      fill // Use fill with object-cover
                      style={{ objectFit: 'cover' }}
                      sizes="80px" // Optimize loading for small fixed size
                    />
                  </div>
                   {/* ... (Rest of list item info remains the same) ... */}
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


// The default export now wraps the content component in Suspense
export default function ComicsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ComicsPageContent />
    </Suspense>
  )
}