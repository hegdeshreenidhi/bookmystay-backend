// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { getUserBookings } from '../api';

const STATUS_STYLE = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100  text-green-800',
  cancelled: 'bg-red-100    text-red-800',
};

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const Dashboard = () => {
  const navigate         = useNavigate();
  const { getToken }     = useAuth();
  const { isSignedIn, isLoaded } = useUser();

  // ── All bookings fetched from DB ───────────────────────
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // ── Cancel confirmation modal ─────────────────────────
  const [cancelTarget, setCancelTarget] = useState(null);
  const [showCancel, setShowCancel]     = useState(false);
  const [cancelled, setCancelled]       = useState(false); // for post-cancel UI

  // ── Fetch bookings on sign-in ─────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }

    const load = async () => {
      try {
        const token = await getToken();
        const res   = await getUserBookings(token);
        if (res.data.success) setBookings(res.data.bookings);
        else setError('Could not load bookings.');
      } catch {
        setError('Failed to connect. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, isSignedIn]);

  // ── Cancel (removes from local view — no cancel API yet) ──
  const handleCancelBooking = () => {
    setBookings(prev => prev.filter(b => b._id !== cancelTarget._id));
    setShowCancel(false);
    setCancelTarget(null);
    setCancelled(true);
    // Reset cancelled banner after 3 s
    setTimeout(() => setCancelled(false), 3000);
  };

  // ── Loading / not signed in ────────────────────────────
  if (!isLoaded || loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-500 text-lg">Loading your bookings…</p>
    </div>
  );

  if (!isSignedIn) return (
    <div className="px-6 md:px-20 py-20 text-center">
      <p className="text-gray-500 text-lg mb-6">Please log in to view your bookings.</p>
      <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 rounded-xl font-semibold">
        Go Home
      </button>
    </div>
  );

  return (
    <div className="px-6 md:px-20 py-20 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Booking Dashboard</h1>
      <p className="text-gray-500 mb-10">Your current and past reservations</p>

      {/* ── Cancelled banner ────────────────────────────── */}
      {cancelled && (
        <div className="max-w-2xl mb-6 bg-white rounded-2xl shadow border overflow-hidden">
          <div className="bg-red-500 px-6 py-5 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Booking Cancelled</p>
              <p className="text-red-100 text-sm">Your reservation has been cancelled.</p>
            </div>
          </div>
          <div className="px-6 py-6 text-center">
            <p className="text-gray-500 mb-5">We hope to see you again!</p>
            <button onClick={() => navigate('/rooms')}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
              Browse Rooms Again
            </button>
          </div>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────── */}
      {error && <p className="text-red-500 mb-6">{error}</p>}

      {/* ── Empty state ─────────────────────────────────── */}
      {!error && bookings.length === 0 && !cancelled && (
        <div className="text-center py-20">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                   M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-6">No booking details found.</p>
          <button onClick={() => navigate('/rooms')}
            className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
            Browse Rooms
          </button>
        </div>
      )}

      {/* ── Booking cards ────────────────────────────────── */}
      <div className="flex flex-col gap-6 max-w-2xl">
        {bookings.map(booking => (
          <div key={booking._id} className="bg-white rounded-2xl shadow border overflow-hidden">

            {/* Header */}
            <div className="bg-green-500 px-6 py-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white flex-shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-lg leading-tight truncate">
                  {booking.room?.roomType}
                </p>
                <p className="text-green-100 text-sm truncate">
                  {booking.hotel?.name} · {booking.hotel?.city}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
              </span>
            </div>

            {/* Detail rows */}
            <div className="px-6 py-5 space-y-3 text-sm">
              {[
                ['Check-in',  fmt(booking.checkInDate)],
                ['Check-out', fmt(booking.checkOutDate)],
                ['Guests',    booking.guests],
                ['Payment',   booking.paymentMethod],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-gray-500 font-medium">{label}</span>
                  <span className="font-semibold text-gray-800">{val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 bg-green-50 rounded-xl px-4 mt-2">
                <span className="text-gray-700 font-bold">Total Amount</span>
                <span className="text-green-600 font-bold text-xl">₹{booking.totalPrice}</span>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 pb-6 flex flex-col gap-3">
              <button onClick={() => navigate('/rooms')}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
                Book Another Room
              </button>
              {booking.status !== 'cancelled' && (
                <button
                  onClick={() => { setCancelTarget(booking); setShowCancel(true); }}
                  className="w-full bg-white text-red-500 py-3 rounded-xl font-semibold border-2 border-red-400 hover:bg-red-50 transition">
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Cancel Confirmation Modal ────────────────────── */}
      {showCancel && cancelTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Cancel Booking?</h2>
            <p className="text-gray-500 text-sm mb-1">You are about to cancel</p>
            <p className="font-semibold text-gray-800 mb-1">{cancelTarget.room?.roomType}</p>
            <p className="text-gray-500 text-sm mb-6">
              {fmt(cancelTarget.checkInDate)} → {fmt(cancelTarget.checkOutDate)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setShowCancel(false); setCancelTarget(null); }}
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