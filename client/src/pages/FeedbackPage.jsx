import React, { useState } from "react";

const FeedbackPage = () => {
const [feedbacks, setFeedbacks] = useState([
{
name: "Rahul Sharma",
rating: 5,
message: "Amazing stay! The rooms were clean and the service was excellent.",
},
{
name: "Priya Patel",
rating: 4,
message: "Loved the atmosphere and the staff were very friendly.",
},
{
name: "John Smith",
rating: 5,
message: "Great experience! I will definitely book again.",
},
]);

const [form, setForm] = useState({
name: "",
email: "",
rating: 5,
message: "",
});

const handleSubmit = (e) => {
e.preventDefault();

```
const newFeedback = {
  name: form.name,
  rating: form.rating,
  message: form.message,
};

setFeedbacks([newFeedback, ...feedbacks]);

setForm({
  name: "",
  email: "",
  rating: 5,
  message: "",
});
```

};

return ( <div className="px-6 md:px-20 py-20">

```
  {/* Feedback Form */}
  <div className="max-w-2xl mx-auto bg-white shadow-lg p-8 rounded-xl border mb-16">
    <h2 className="text-2xl font-bold mb-6 text-center">Leave Your Feedback</h2>

    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        type="text"
        placeholder="Your Name"
        className="w-full border p-3 rounded"
        value={form.name}
        onChange={(e) => setForm({...form, name: e.target.value})}
        required
      />

      <input
        type="email"
        placeholder="Email Address"
        className="w-full border p-3 rounded"
        value={form.email}
        onChange={(e) => setForm({...form, email: e.target.value})}
        required
      />

      {/* Rating */}
      <select
        className="w-full border p-3 rounded"
        value={form.rating}
        onChange={(e) => setForm({...form, rating: e.target.value})}
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
        onChange={(e) => setForm({...form, message: e.target.value})}
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

  {/* Feedback List */}


  <div className="grid md:grid-cols-3 gap-8">
    {feedbacks.map((fb, index) => (
      <div
        key={index}
        className="bg-white shadow-lg p-6 rounded-xl border"
      >
        <h3 className="text-lg font-semibold mb-2">{fb.name}</h3>
        <p className="text-yellow-500 mb-2">
          {"⭐".repeat(fb.rating)}
        </p>
        <p className="text-gray-600">{fb.message}</p>
      </div>
    ))}
  </div>

</div>

);
};

export default FeedbackPage;