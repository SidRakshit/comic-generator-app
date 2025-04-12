"use client"

import { useState } from 'react';

// Define a proper interface for your user objects
interface User {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  // Add other properties your users might have
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      // Use type assertion to avoid 'any' type
      setError((err as Error).message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-6">User Dashboard</h1>
        
        <button 
          onClick={fetchUsers}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Users'}
        </button>
        
        {loading && <p className="text-gray-500">Loading users...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        {users.length > 0 && (
          <div className="mt-4">
            <h2 className="text-2xl font-semibold mb-4">User List</h2>
            <ul className="border rounded p-4">
              {users.map((user) => (
                <li key={user.id} className="mb-2 p-2 border-b">
                  {user.username || user.name || user.email || JSON.stringify(user)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && users.length === 0 && (
          <p className="text-gray-500">No users found. Click the button to fetch users.</p>
        )}
      </div>
    </main>
  );
}