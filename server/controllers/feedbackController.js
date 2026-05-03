import Feedback from "../models/Feedback.js";

// GET all feedbacks
export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
};

// POST new feedback
export const createFeedback = async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;

    const feedback = new Feedback({
      name,
      email,
      rating,
      message,
      userId: req.user ? req.user.id : null, // if logged in
    });

    const saved = await feedback.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};
