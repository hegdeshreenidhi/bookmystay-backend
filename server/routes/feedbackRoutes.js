import express from "express";
import { getFeedbacks, createFeedback } from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js"; // optional

const router = express.Router();

// Public: view all feedbacks
router.get("/", getFeedbacks);

// Protected: only logged-in users can submit
router.post("/", protect, createFeedback);

export default router;
