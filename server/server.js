import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// Connect DB (will run on cold start)
connectDB()
connectCloudinary();

const app = express();
// middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// API to listen to clerk webhook
app.use("/api/clerk", clerkWebhooks);

// test route
app.get("/", (req, res) => res.send("API IS working fine"));
app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/bookings', bookingRouter)


export default app;