import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(state);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleCancelBooking = () => {
    setBooking(null);
    setCancelled(true);
    setShowCancelConfirm(false);
  };

  return (
    <div className="px-6 md:px-20 py-20 min-h-screen bg-gray-50">

      <h1 className="text-3xl font-bold mb-2 text-gray-800">Booking Dashboard</h1>
      <p className="text-gray-500 mb-10">Your latest booking summary</p>

      {/* ── Cancelled state ── */}
      {cancelled && (
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden max-w-xl">
          <div className="bg-red-500 px-6 py-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Booking Cancelled</p>
              <p className="text-red-100 text-sm">Your reservation has been cancelled</p>
            </div>
          </div>
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500 mb-6">Your booking has been successfully cancelled. We hope to see you again!</p>
            <button onClick={() => navigate("/rooms")}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
              Browse Rooms Again
            </button>
          </div>
        </div>
      )}

      {/* ── Active booking ── */}
      {booking && !cancelled && (
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden max-w-xl">

          {/* Green header banner */}
          <div className="bg-green-500 px-6 py-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Booking Confirmed</p>
              <p className="text-green-100 text-sm">Payment received successfully</p>
            </div>
          </div>

          {/* Discount applied banner */}
          {booking.discountApplied && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex items-center gap-2 text-yellow-700 text-sm font-medium">
              <span className="text-base">🎉</span>
              <span>You saved <strong>₹{booking.discountAmount}</strong> with our 25% long-stay discount!</span>
            </div>
          )}

          {/* Booking details */}
          <div className="px-6 py-6 space-y-4 text-sm">

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-500 font-medium">Room Type</span>
              <span className="font-semibold text-gray-800">{booking.room}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-500 font-medium">Room No.</span>
              <span className="font-semibold text-gray-800">
                {Array.isArray(booking.roomNumbers) ? booking.roomNumbers.join(", ") : booking.roomNumbers || "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-500 font-medium">Check-in</span>
              <span className="font-semibold text-gray-800">{booking.checkIn}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-500 font-medium">Check-out</span>
              <span className="font-semibold text-gray-800">{booking.checkOut}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-500 font-medium">Number of Days</span>
              <span className="font-semibold text-gray-800">
                {booking.days} {booking.days === 1 ? "night" : "nights"}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-500 font-medium">Payment Mode</span>
              <span className="font-semibold text-gray-800">
                {booking.onlineMethod || booking.paymentMode || "—"}
              </span>
            </div>

            {booking.request && booking.request.trim() !== "" && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-500 font-medium">Special Request</span>
                <span className="font-semibold text-gray-800">{booking.request}</span>
              </div>
            )}

            {/* Pricing breakdown */}
            {booking.discountApplied ? (
              <>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-500 font-medium">Original Price</span>
                  <span className="line-through text-gray-400">₹{booking.basePrice}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-green-600 font-medium">🎉 25% Discount</span>
                  <span className="text-green-600 font-semibold">- ₹{booking.discountAmount}</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-green-50 rounded-xl px-4">
                  <span className="text-gray-700 font-bold text-base">Total Amount Paid</span>
                  <span className="text-green-600 font-bold text-xl">₹{booking.price}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center py-4 bg-green-50 rounded-xl px-4">
                <span className="text-gray-700 font-bold text-base">Total Amount Paid</span>
                <span className="text-green-600 font-bold text-xl">₹{booking.price}</span>
              </div>
            )}

          </div>

          {/* Footer buttons */}
          <div className="px-6 pb-6 flex flex-col gap-3">
            <button onClick={() => navigate("/rooms")}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
              Book Another Room
            </button>
            <button onClick={() => setShowCancelConfirm(true)}
              className="w-full bg-white text-red-500 py-3 rounded-xl font-semibold border-2 border-red-400 hover:bg-red-50 transition">
              Cancel Booking
            </button>
          </div>

        </div>
      )}

      {/* ── No booking state ── */}
      {!booking && !cancelled && (
        <div className="text-center py-20">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-6">No booking details found.</p>
          <button onClick={() => navigate("/rooms")}
            className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
            Browse Rooms
          </button>
        </div>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Cancel Booking?</h2>
            <p className="text-gray-500 text-sm mb-2">You are about to cancel your booking for</p>
            <p className="font-semibold text-gray-800 mb-1">{booking?.room}</p>
            <p className="text-gray-500 text-sm mb-6">
              Room No. {Array.isArray(booking?.roomNumbers) ? booking.roomNumbers.join(", ") : booking?.roomNumbers} &nbsp;·&nbsp; {booking?.days} {booking?.days === 1 ? "night" : "nights"}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                Keep Booking
              </button>
              <button onClick={handleCancelBooking}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;