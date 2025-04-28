// src/app/profile/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  User, Edit, Save, Image as ImageIcon, BookOpen, Heart, // Renamed Image icon import
  Settings, ChevronRight, PlusCircle, Mail, Globe, Twitter
} from 'lucide-react';

// ... (Keep mock data as it was) ...
const userData = { username: 'ComicFan2024', name: 'Alex Johnson', bio: 'Comic enthusiast and amateur storyteller. I love creating sci-fi and fantasy comics!', avatarUrl: '/api/placeholder/150/150', joinDate: 'March, 2024', email: 'alex.johnson@example.com', website: 'alexjohnson.example.com', twitter: '@comicfan2024', stats: { created: 12, favorites: 38, followers: 127, following: 84 } };
const userCreatedComics = [ { id: 'comic-1', title: 'Space Explorer Chronicles', coverImage: '/api/placeholder/300/400?text=Space+Explorer', createdAt: 'April 15, 2025', likes: 24 }, { id: 'comic-2', title: 'The Last Dragon', coverImage: '/api/placeholder/300/400?text=Last+Dragon', createdAt: 'April 2, 2025', likes: 18 }, { id: 'comic-3', title: 'Cybernetic Dreams', coverImage: '/api/placeholder/300/400?text=Cybernetic+Dreams', createdAt: 'March 20, 2025', likes: 32 } ];
const userFavoriteComics = [ { id: 'comic-4', title: 'Heroes of Tomorrow', author: 'CosmicCreator', coverImage: '/api/placeholder/300/400?text=Heroes+Tomorrow', likes: 87 }, { id: 'comic-5', title: 'Mystery Island', author: 'StoryWeaver', coverImage: '/api/placeholder/300/400?text=Mystery+Island', likes: 56 } ];


export default function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(userData);

  const handleSaveProfile = () => {
     setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Profile header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <Image 
                src={profileData.avatarUrl} 
                alt={`${profileData.name}'s avatar`}
                width={128}
                height={128}
                className="rounded-full object-cover border-4 border-white shadow"
              />
              {isEditingProfile && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700">                  
                  <ImageIcon size={16} /> 
                </button>
              )}
            </div>
            
             <div className="flex-1 text-center md:text-left">
              {isEditingProfile ? ( <div className="space-y-3"> <div> <label className="block text-sm font-medium text-gray-700">Display Name</label> <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /> </div> <div> <label className="block text-sm font-medium text-gray-700">Username</label> <input type="text" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /> </div> <div> <label className="block text-sm font-medium text-gray-700">Bio</label> <textarea value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /> </div> </div> ) : ( <> <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1> <p className="text-gray-600">@{profileData.username}</p> <p className="mt-2 text-gray-700 max-w-2xl">{profileData.bio}</p> </> )}
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2"> {isEditingProfile ? ( <> <Button onClick={handleSaveProfile} className="flex items-center"> <Save size={16} className="mr-1" /> Save Changes </Button> <Button variant="outline" onClick={() => { setIsEditingProfile(false); setProfileData(userData); /* Reset changes */ }}> Cancel </Button> </> ) : ( <Button variant="outline" className="flex items-center" onClick={() => setIsEditingProfile(true)} > <Edit size={16} className="mr-1" /> Edit Profile </Button> )} </div>
            </div>
            
            <div className="mt-6 md:mt-0 flex flex-col items-center md:items-end space-y-2">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 px-4 py-2 rounded-lg"> <div className="text-2xl font-bold text-gray-900">{profileData.stats.created}</div> <div className="text-sm text-gray-500">Comics</div> </div> <div className="bg-gray-50 px-4 py-2 rounded-lg"> <div className="text-2xl font-bold text-gray-900">{profileData.stats.favorites}</div> <div className="text-sm text-gray-500">Favorites</div> </div> <div className="bg-gray-50 px-4 py-2 rounded-lg"> <div className="text-2xl font-bold text-gray-900">{profileData.stats.followers}</div> <div className="text-sm text-gray-500">Followers</div> </div> <div className="bg-gray-50 px-4 py-2 rounded-lg"> <div className="text-2xl font-bold text-gray-900">{profileData.stats.following}</div> <div className="text-sm text-gray-500">Following</div> </div>
              </div>
              <div className="text-sm text-gray-500"> Joined {profileData.joinDate} </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Tabs defaultValue="comics">
          <TabsList className="mb-8"> <TabsTrigger value="comics" className="flex items-center"> <BookOpen size={16} className="mr-1" /> My Comics </TabsTrigger> <TabsTrigger value="favorites" className="flex items-center"> <Heart size={16} className="mr-1" /> Favorites </TabsTrigger> <TabsTrigger value="settings" className="flex items-center"> <Settings size={16} className="mr-1" /> Settings </TabsTrigger> </TabsList>
          
          <TabsContent value="comics" className="space-y-6">
             <div className="flex justify-between items-center"> <h2 className="text-xl font-bold text-gray-900">My Comics</h2> <Link href="/comics/create" className="flex items-center text-blue-600 hover:text-blue-800" > <PlusCircle size={16} className="mr-1" /> Create New Comic </Link> </div>
            
            {userCreatedComics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCreatedComics.map(comic => (
                  <Link href={`/comics/${comic.id}`} key={comic.id}>
                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">                       
                      <div className="aspect-[3/4] bg-gray-100 relative">                         
                        <Image
                          src={comic.coverImage}
                          alt={comic.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>                       
                      <div className="p-4"> <h3 className="font-medium text-lg text-gray-900 mb-1">{comic.title}</h3> <div className="flex justify-between text-sm text-gray-500"> <span>Created: {comic.createdAt}</span> <span className="flex items-center"> <Heart size={14} className="mr-1 text-red-500" /> {comic.likes} </span> </div> </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (               
              <div className="text-center py-12 bg-white rounded-lg border"> <BookOpen size={48} className="mx-auto text-gray-400 mb-4" /> <h3 className="text-lg font-medium text-gray-900 mb-2">No comics yet</h3> <p className="text-gray-600 mb-4">Start creating your first comic!</p> <Button asChild> <Link href="/comics/create"> Get Started </Link> </Button> </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Favorite Comics</h2>
            
            {userFavoriteComics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userFavoriteComics.map(comic => (
                  <Link href={`/comics/${comic.id}`} key={comic.id}>
                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-[3/4] bg-gray-100 relative"> 
                        <Image
                          src={comic.coverImage}
                          alt={comic.title}
                          fill
                          style={{ objectFit: 'cover' }}
                           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-4"> <h3 className="font-medium text-lg text-gray-900 mb-1">{comic.title}</h3> <div className="flex justify-between text-sm text-gray-500"> <span>By: {comic.author}</span> <span className="flex items-center"> <Heart size={14} className="mr-1 text-red-500" /> {comic.likes} </span> </div> </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border"> <Heart size={48} className="mx-auto text-gray-400 mb-4" /> <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3> <p className="text-gray-600 mb-4">Browse comics and add some to your favorites!</p> <Button asChild> <Link href="/comics"> Browse Comics </Link> </Button> </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
             <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
            <div className="bg-white shadow overflow-hidden rounded-lg"> <div className="px-4 py-5 sm:px-6 border-b"> <h3 className="text-lg font-medium text-gray-900">Personal Information</h3> <p className="mt-1 text-sm text-gray-500">Update your account details and preferences.</p> </div> <div className="px-4 py-5 sm:p-6 space-y-6"> <div> <h4 className="text-md font-medium text-gray-900 mb-2">Contact Information</h4> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label className="block text-sm font-medium text-gray-700">Email</label> <div className="mt-1 flex rounded-md shadow-sm"> <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500"> <Mail size={16} /> </span> <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" /> </div> </div> <div> <label className="block text-sm font-medium text-gray-700">Website</label> <div className="mt-1 flex rounded-md shadow-sm"> <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500"> <Globe size={16} /> </span> <input type="text" value={profileData.website} onChange={(e) => setProfileData({...profileData, website: e.target.value})} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" /> </div> </div> <div> <label className="block text-sm font-medium text-gray-700">Twitter</label> <div className="mt-1 flex rounded-md shadow-sm"> <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500"> <Twitter size={16} /> </span> <input type="text" value={profileData.twitter} onChange={(e) => setProfileData({...profileData, twitter: e.target.value})} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" /> </div> </div> </div> </div> <div> <h4 className="text-md font-medium text-gray-900 mb-2">Account Preferences</h4> <div className="space-y-4"> <div className="flex items-start"> <div className="flex items-center h-5"> <input id="notifications" name="notifications" type="checkbox" defaultChecked className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" /> </div> <div className="ml-3 text-sm"> <label htmlFor="notifications" className="font-medium text-gray-700">Email Notifications</label> <p className="text-gray-500">Receive emails about new comments and likes on your comics.</p> </div> </div> <div className="flex items-start"> <div className="flex items-center h-5"> <input id="public-profile" name="public-profile" type="checkbox" defaultChecked className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" /> </div> <div className="ml-3 text-sm"> <label htmlFor="public-profile" className="font-medium text-gray-700">Public Profile</label> <p className="text-gray-500">Allow other users to view your profile and comics.</p> </div> </div> </div> </div> <div className="pt-5 border-t border-gray-200"> <div className="flex justify-end"> <Button type="submit" className="ml-3"> Save Settings </Button> </div> </div> </div> </div>
            <div className="mt-4 bg-white shadow overflow-hidden rounded-lg"> <div className="px-4 py-5 sm:px-6 border-b"> <h3 className="text-lg font-medium text-gray-900">Security</h3> </div> <div className="px-4 py-5 sm:p-6"> <Link href="/change-password" className="text-blue-600 flex items-center justify-between hover:text-blue-800 p-3 border rounded-md hover:bg-gray-50" > <span>Change Password</span> <ChevronRight size={16} /> </Link> </div> </div>
            <div className="mt-4 bg-white shadow overflow-hidden rounded-lg"> <div className="px-4 py-5 sm:px-6 border-b"> <h3 className="text-lg font-medium text-red-600">Danger Zone</h3> </div> <div className="px-4 py-5 sm:p-6"> <Button variant="destructive"> Delete Account </Button> <p className="mt-2 text-sm text-gray-500"> Once you delete your account, there is no going back. Please be certain. </p> </div> </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}