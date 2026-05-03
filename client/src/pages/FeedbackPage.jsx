import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; // or your auth provider
import axios from "axios";

const FeedbackPage = () => {
  const { isSignedIn, user } = useUser(); // Clerk example
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 5,
    message: "",
  });

  // Fetch feedbacks from DB on mount
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get("/api/feedback"); // backend route
        setFeedbacks(res.data);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      }
    };
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If logged in, auto-fill name/email from user profile
    const newFeedback = {
      name: isSignedIn ? user.fullName : form.name,
      email: isSignedIn ? user.primaryEmailAddress.emailAddress : form.email,
      rating: form.rating,
      message: form.message,
    };

    try {
      const res = await axios.post("/api/feedback", newFeedback);
      setFeedbacks([res.data, ...feedbacks]); // prepend new feedback
      setForm({ name: "", email: "", rating: 5, message: "" });
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  return (
    <div className="px-6 md:px-20 py-20">
      {/* Feedback Form */}
      {isSignedIn && (
        <div className="max-w-2xl mx-auto bg-white shadow-lg p-8 rounded-xl border mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Leave Your Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignedIn && (
              <>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full border p-3 rounded"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full border p-3 rounded"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </>
            )}

            <select
              className="w-full border p-3 rounded"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            >
              <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
              <option value="4">⭐⭐⭐⭐ - Very Good</option>
              <option value="3">⭐⭐⭐ - Good</option>
              <option value="2">⭐⭐ - Average</option>
              <option value="1">⭐ - Poor</option>
            </select>

            <textarea
              placeholder="Write your experience..."
              className="w-full border p-3 rounded"
              rows="4"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            ></textarea>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      )}

      {/* Feedback List */}
      <div className="grid md:grid-cols-3 gap-8">
        {feedbacks.map((fb, index) => (
          <div key={index} className="bg-white shadow-lg p-6 rounded-xl border">
            <h3 className="text-lg font-semibold mb-2">{fb.name}</h3>
            <p className="text-yellow-500 mb-2">{"⭐".repeat(fb.rating)}</p>
            <p className="text-gray-600">{fb.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackPage;
