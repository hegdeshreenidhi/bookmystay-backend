import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { getUserBookings } from '../api';

const HEADER_COLOR = {
  pending:   { bg: '#f59e0b', icon: '⏳', label: 'Confirmation Pending' },
  confirmed: { bg: '#10b981', icon: '✓',  label: 'Booking Confirmed'    },
  cancelled: { bg: '#ef4444', icon: '✕',  label: 'Cancelled'            },
};

const STATUS_BADGE = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100  text-green-800',
  cancelled: 'bg-red-100    text-red-800',
};

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const Dashboard = () => {
  const navigate             = useNavigate();
  const { getToken }         = useAuth();
  const { isSignedIn, isLoaded } = useUser();

  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [showCancel, setShowCancel]     = useState(false);
  const [cancelled, setCancelled]       = useState(false);

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

  const handleCancelBooking = () => {
    setBookings(prev => prev.filter(b => b._id !== cancelTarget._id));
    setShowCancel(false);
    setCancelTarget(null);
    setCancelled(true);
    setTimeout(() => setCancelled(false), 3000);
  };

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
      <h1 className="text-3xl font-bold mb-2 text-gray-800">My Bookings</h1>
      <p className="text-gray-500 mb-10">Your current and past reservations</p>

      {cancelled && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium">
          Booking removed from your list.
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {bookings.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-6">You have no bookings yet.</p>
          <button onClick={() => navigate('/rooms')} className="bg-black text-white px-8 py-3 rounded-xl font-semibold">
            Browse Rooms
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6 max-w-2xl">
        {bookings.map(booking => {
          const header = HEADER_COLOR[booking.status] || HEADER_COLOR.pending;
          return (
            <div key={booking._id} className="bg-white rounded-2xl shadow border overflow-hidden">

              {/* Dynamic header based on status */}
              <div style={{ background: header.bg }} className="px-6 py-5 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20 flex-shrink-0">
                  <span style={{ fontSize: 22, color: '#fff' }}>{header.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-lg leading-tight truncate">
                    {booking.room?.roomType} #{booking.room?.roomNumber}
                  </p>
                  <p className="text-white text-opacity-80 text-sm truncate" style={{ opacity: 0.85 }}>
                    {booking.hotel?.name} · {booking.hotel?.city}
                  </p>
                </div>
                <div>
                  <span className="text-white font-bold text-sm px-3 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {header.label}
                  </span>
                </div>
              </div>

              {/* Pending notice banner */}
              {booking.status === 'pending' && (
                <div className="mx-6 mt-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                  ⏳ <strong>Awaiting owner confirmation.</strong> You'll see an update here once the owner reviews your request.
                </div>
              )}

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
                <div className="flex justify-between items-center py-3 bg-gray-50 rounded-xl px-4 mt-2">
                  <span className="text-gray-700 font-bold">Total Amount</span>
                  <span className="text-gray-900 font-bold text-xl">₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Footer */}
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
          );
        })}
      </div>

      {/* Cancel Modal */}
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