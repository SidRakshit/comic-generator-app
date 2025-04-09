"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("Loading...");
  const [apiUrl, setApiUrl] = useState<string>("");

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
        console.log("Response status:", response.status); // Log the status code for debugging
        
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Response data:", data); // Log the data for debugging
        setMessage(data.message);
      } catch (error) {
        console.error("Fetch error:", error);  // Log detailed error
        setMessage("Error: Unable to fetch data");
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <h1>Comic App Backend Status</h1>
      <p>{message}</p>
      <p>API URL: {apiUrl}</p>
    </div>
  );
}
