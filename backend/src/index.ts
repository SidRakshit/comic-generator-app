// src/index.ts
import express from "express";
// Only import PORT if needed, otherwise define directly for test
import { PORT } from "./config";
import mainApiRouter from "./routes/index";
// import './database';

const app = express();

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
