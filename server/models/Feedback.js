import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true },
    userId: { type: String }, // optional: link to logged-in user
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
