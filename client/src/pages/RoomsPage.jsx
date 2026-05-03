// client/src/pages/RoomsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { getRooms, createBooking, checkAvailability } from '../api';

const RoomsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const { getToken } = useAuth();

  // ── Data ──────────────────────────────────────────────
  const [rooms, setRooms]               = useState([]);
  const [loading, setLoading]           = useState(true);

  // ── UI state ──────────────────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [previewOpen, setPreviewOpen]   = useState(false);
  const [bookingOpen, setBookingOpen]   = useState(false);
  const [onlineOpen, setOnlineOpen]     = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(null);

  // ── Form state ────────────────────────────────────────
  const [checkInVal, setCheckInVal]     = useState('');
  const [checkOutVal, setCheckOutVal]   = useState('');
  const [guestsVal, setGuestsVal]       = useState(1);
  const [paymentMode, setPaymentMode]   = useState('');
  const [onlineMethod, setOnlineMethod] = useState('');
  const [pendingBooking, setPendingBooking] = useState(null);

  // ── Filter state ──────────────────────────────────────
  const [sortOrder, setSortOrder]       = useState('');
  const [roomType, setRoomType]         = useState('');

  // ── Async state ───────────────────────────────────────
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');

  // ── Fetch rooms on mount ───────────────────────────────
  useEffect(() => {
    getRooms()
      .then(res => { if (res.data.success) setRooms(res.data.rooms); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Live price calculation ─────────────────────────────
  const computePrice = (checkIn, checkOut, room) => {
    if (!checkIn || !checkOut || !room) return null;
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000);
    if (days <= 0) return null;
    return { days, total: room.pricePerNight * days };
  };
  const livePrice = computePrice(checkInVal, checkOutVal, selectedRoom);

  // ── Helpers ───────────────────────────────────────────
  const resetBookingForm = () => {
    setCheckInVal(''); setCheckOutVal('');
    setGuestsVal(1); setPaymentMode('');
    setOnlineMethod(''); setError('');
  };

  const openPreview = (room) => { setSelectedRoom(room); setPreviewOpen(true); };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedRoom(null);
    resetBookingForm();
  };

  const closeBooking = () => {
    setBookingOpen(false);
    resetBookingForm();
  };

  const handleBookClick = () => {
    if (!user) { setShowLoginPopup(true); return; }
    setBookingOpen(true);
  };

  // ── Submit booking ────────────────────────────────────
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const pricing = computePrice(checkInVal, checkOutVal, selectedRoom);
    if (!pricing) { setError('Check-out must be after check-in.'); return; }

    setSubmitting(true);
    setError('');

    try {
      // 1. Check availability
      const availRes = await checkAvailability({
        room: selectedRoom._id,
        checkInDate: checkInVal,
        checkOutDate: checkOutVal,
      });
      if (!availRes.data.isAvailable) {
        setError('This room is not available for the selected dates.');
        return;
      }

      const details = {
        roomId:    selectedRoom._id,
        hotelId:   selectedRoom.hotel._id,
        roomName:  selectedRoom.roomType,
        hotelName: selectedRoom.hotel.name,
        hotelCity: selectedRoom.hotel.city,
        checkIn:   checkInVal,
        checkOut:  checkOutVal,
        days:      pricing.days,
        price:     pricing.total,
        paymentMode,
        guests:    Number(guestsVal),
      };

      // 2a. Online → show payment modal first
      if (paymentMode === 'Online') {
        setPendingBooking(details);
        setOnlineOpen(true);
        return;
      }

      // 2b. Cash → save directly to DB
      await saveBooking(details);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveBooking = async (details) => {
    const token = await getToken();
    const res = await createBooking(
      {
        room:         details.roomId,
        hotel:        details.hotelId,
        checkInDate:  details.checkIn,
        checkOutDate: details.checkOut,
        guests:       details.guests,
      },
      token,
    );
    if (!res.data.success) throw new Error(res.data.message);
    setOnlineOpen(false);
    closeBooking();
    closePreview();
    setSuccessPopup({ ...details, bookingId: res.data.booking._id });
  };

  const confirmOnlinePayment = async () => {
    if (!onlineMethod) { alert('Please select a payment method.'); return; }
    setSubmitting(true);
    try {
      await saveBooking({ ...pendingBooking, onlineMethod });
    } catch {
      alert('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filter & sort ─────────────────────────────────────
  let filtered = rooms.filter(r => !roomType || r.roomType === roomType);
  if (sortOrder === 'low-high')  filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
  if (sortOrder === 'high-low') filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
  const types  = [...new Set(rooms.map(r => r.roomType))];
  const today  = new Date().toISOString().split('T')[0];

  // ── Loading state ─────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-500 text-lg">Loading rooms…</p>
    </div>
  );

  return (
    <div className="px-6 md:px-20 py-20">
      <h1 className="text-4xl font-bold text-center mb-10">Our Rooms</h1>

      {/* ── Filters ────────────────────────────────────── */}
      <div className="mb-10 flex flex-col md:flex-row gap-6 justify-center">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Sort by Price</label>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="border px-3 py-2 rounded w-48">
            <option value="">Default</option>
            <option value="low-high">Low to High</option>
            <option value="high-low">High to Low</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Room Type</label>
          <select value={roomType} onChange={e => setRoomType(e.target.value)} className="border px-3 py-2 rounded w-48">
            <option value="">All</option>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ── Room Grid ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 mt-20">No rooms available.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          {filtered.map(room => (
            <div key={room._id} onClick={() => openPreview(room)}
              className="shadow-lg rounded-xl overflow-hidden border hover:scale-105 transition cursor-pointer">
              {room.images?.[0] && (
                <img src={room.images[0]} alt={room.roomType} className="w-full h-40 object-cover" />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold">{room.roomType}</h2>
                <p className="text-gray-500 text-sm mt-1">{room.hotel?.name} · {room.hotel?.city}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {room.amenities?.slice(0, 3).map((a, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{a}</span>
                  ))}
                </div>
                <p className="text-lg font-bold mt-4">₹{room.pricePerNight} <span className="text-sm font-normal text-gray-500">/ night</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Preview Modal ──────────────────────────────── */}
      {previewOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-4 right-4 text-xl font-bold" onClick={closePreview}>✕</button>
            <h2 className="text-2xl font-bold mb-1">{selectedRoom.roomType}</h2>
            <p className="text-gray-500 text-sm mb-4">{selectedRoom.hotel?.name} · {selectedRoom.hotel?.city}</p>

            {/* Images */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
              {selectedRoom.images?.map((img, i) => (
                <img key={i} src={img} alt={`room-${i}`} className="w-44 h-28 object-cover rounded flex-shrink-0" />
              ))}
            </div>

            {/* Amenities */}
            {selectedRoom.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedRoom.amenities.map((a, i) => (
                  <span key={i} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{a}</span>
                ))}
              </div>
            )}

            <p className="text-2xl font-bold mb-6">
              ₹{selectedRoom.pricePerNight}
              <span className="text-sm font-normal text-gray-500"> / night</span>
            </p>
            <button onClick={handleBookClick}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
              Book Now
            </button>
          </div>
        </div>
      )}

      {/* ── Booking Modal ──────────────────────────────── */}
      {bookingOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-xl font-bold" onClick={closeBooking}>✕</button>
            <h2 className="text-xl font-bold mb-1">Book Room</h2>
            <p className="text-gray-500 text-sm mb-5">{selectedRoom.roomType} · ₹{selectedRoom.pricePerNight}/night</p>

            <form className="space-y-4" onSubmit={handleBookingSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Check-in Date</label>
                <input type="date" required min={today}
                  value={checkInVal} onChange={e => setCheckInVal(e.target.value)}
                  className="w-full border p-2 rounded" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Check-out Date</label>
                <input type="date" required min={checkInVal || today}
                  value={checkOutVal} onChange={e => setCheckOutVal(e.target.value)}
                  className="w-full border p-2 rounded" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Guests</label>
                <input type="number" min="1" max="10" required
                  value={guestsVal} onChange={e => setGuestsVal(e.target.value)}
                  className="w-full border p-2 rounded" />
              </div>

              {/* Live price */}
              {livePrice && (
                <div className="bg-gray-50 border rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Duration</span>
                    <span className="font-medium">{livePrice.days} {livePrice.days === 1 ? 'night' : 'nights'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
                    <span>Total</span>
                    <span>₹{livePrice.total}</span>
                  </div>
                </div>
              )}

              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} required className="w-full border p-2 rounded">
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button type="submit" disabled={submitting}
                className="w-full bg-black text-white py-2.5 rounded-xl font-semibold disabled:opacity-50">
                {submitting ? 'Booking…' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Online Payment Modal ────────────────────────── */}
      {onlineOpen && pendingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-xl font-bold" onClick={() => setOnlineOpen(false)}>✕</button>
            <h2 className="text-xl font-bold mb-6">Online Payment</h2>
            <div className="bg-gray-50 border rounded-xl p-4 mb-5 flex justify-between font-bold text-base">
              <span>Total Amount</span>
              <span>₹{pendingBooking.price}</span>
            </div>
            <div className="space-y-3">
              {['UPI', 'Google Pay', 'PhonePe', 'Debit / Credit Card'].map(method => (
                <label key={method} className="flex gap-2 items-center cursor-pointer">
                  <input type="radio" name="pay" value={method} onChange={e => setOnlineMethod(e.target.value)} />
                  {method}
                </label>
              ))}
            </div>
            <button onClick={confirmOnlinePayment} disabled={submitting}
              className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold mt-6 disabled:opacity-50">
              {submitting ? 'Processing…' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      )}

      {/* ── Success Popup ───────────────────────────────── */}
      {successPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-5">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Booking Successful!</h2>
            <p className="text-gray-400 text-sm mb-6">Your reservation is confirmed.</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6 text-sm">
              {[
                ['Room',     successPopup.roomName],
                ['Hotel',    successPopup.hotelName],
                ['Check-in', successPopup.checkIn],
                ['Check-out',successPopup.checkOut],
                ['Nights',   successPopup.days],
                ['Payment',  successPopup.onlineMethod || successPopup.paymentMode],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total</span>
                <span className="text-green-600 font-bold text-lg">₹{successPopup.price}</span>
              </div>
            </div>
            <button onClick={() => { setSuccessPopup(null); navigate('/dashboard'); }}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
              View Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── Login Popup ─────────────────────────────────── */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mx-auto mb-5">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">You're Not Logged In</h2>
            <p className="text-gray-500 text-sm mb-8">Please log in to book a room.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setShowLoginPopup(false); openSignIn(); }}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold">Login</button>
              <button onClick={() => setShowLoginPopup(false)}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;