"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("Loading...");
  const [apiUrl, setApiUrl] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Set the API URL from environment variable
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://comiccreator.info/api";
        setApiUrl(apiUrl);
        console.log("Attempting to connect to API URL:", apiUrl);
  
        // Make the fetch request
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Response data:", data);
        setMessage(data.message);
      } catch (error) {
        console.error("Fetch error:", error);
        setMessage("Error: Unable to fetch data");
      }
    }

    fetchData();
  }, []);

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://comiccreator.info/api";
      const usersUrl = `${baseUrl}/users`;
      
      console.log("Fetching users from:", usersUrl);
      
      const response = await fetch(usersUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log("Users data:", userData);
      setUsers(userData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comic App Backend Status</h1>
      <p className="mb-2">{message}</p>
      <p className="mb-4">API URL: {apiUrl}</p>
      
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={fetchUsers}
      >
        Get Users
      </button>
      
      {users.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Users List</h2>
          <ul className="border rounded p-4">
            {users.map((user) => (
              <li key={user.id} className="mb-2 p-2 border-b">
                {user.username || user.name || user.email || JSON.stringify(user)}
              </li>
            ))}
          </ul>
        </div>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : null}
    </div>
  );
}