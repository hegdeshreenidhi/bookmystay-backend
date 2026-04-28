import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

// Connect DB (will run on cold start)
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// API to listen to clerk webhook
app.use("/api/clerk", clerkWebhooks);

// test route
app.get("/", (req, res) => res.send("API IS working fine"));

// ❌ REMOVE app.listen()
// ✅ EXPORT the app for Vercel
export default app;