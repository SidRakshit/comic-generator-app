// src/index.ts
import 'dotenv/config';
import express from "express";
import cors from 'cors';
// Only import PORT if needed, otherwise define directly for test
import { PORT, FRONTEND_URL } from './config';

import mainApiRouter from "./routes/index";
// import './database';

const app = express();

const allowedOrigins = FRONTEND_URL.split(',').map(origin => origin.trim());

// ADD THESE TWO LINES FOR DEBUGGING
console.log("--- CORS DEBUG ---");
console.log("Allowed Origins:", allowedOrigins);


const corsOptions = {
  origin: FRONTEND_URL, // This uses the URL from your .env.local
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- Routes ---
app.use("/api", mainApiRouter);

// Keep only the simplest possible route
app.get("/", (req, res) => {
	res.send("Minimal OK");
});

// --- Start Server ---
app.listen(PORT, () => {
	console.log(`Minimal Server running on http://localhost:${PORT}`);
});
