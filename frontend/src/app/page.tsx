"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}`
        );
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        setMessage("Error: Unable to fetch data");
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Comic App Backend Status</h1>
      <p>{message}</p>
    </div>
  );
}
