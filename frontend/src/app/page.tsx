"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("Loading...");
  const [apiUrl, setApiUrl] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "URL not set";
        setApiUrl(apiUrl);
        console.log("API URL:", apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error("Fetch error:", error);
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
