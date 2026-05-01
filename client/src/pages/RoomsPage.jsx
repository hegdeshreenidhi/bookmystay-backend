import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";

const RoomsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [roomType, setRoomType] = useState("");
  const [onlinePaymentOpen, setOnlinePaymentOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [onlineMethod, setOnlineMethod] = useState("");
  const [successPopup, setSuccessPopup] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Live date tracking for discount preview inside booking form
  const [checkInVal, setCheckInVal] = useState("");
  const [checkOutVal, setCheckOutVal] = useState("");

  const bookedRooms = [];

  const rooms = [
    { name: "Deluxe Room", price: 2500, desc: "Cozy deluxe room with modern amenities.", images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=400&h=300&fit=crop"], type: "Deluxe" },
    { name: "Luxury Suite", price: 4500, desc: "Spacious luxury suite with balcony.", images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop"], type: "Luxury" },
    { name: "Executive Room", price: 3800, desc: "Perfect for business travelers.", images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop"], type: "Executive" },
    { name: "Family Suite", price: 5200, desc: "Large suite ideal for families.", images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop"], type: "Family Suite" },
    { name: "Honeymoon Suite", price: 6500, desc: "Romantic suite designed for couples.", images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1549294413-26f195200c16?w=400&h=300&fit=crop"], type: "Honeymoon Suite" },
    { name: "Superior Room", price: 3000, desc: "Comfortable room with premium interiors.", images: ["https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400&h=300&fit=crop"], type: "Superior" },
    { name: "Studio Room", price: 3400, desc: "Modern studio style room.", images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&h=300&fit=crop"], type: "Studio" },
    { name: "Garden View Room", price: 3600, desc: "Room with relaxing garden view.", images: ["https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400&h=300&fit=crop"], type: "Garden View" },
    { name: "Presidential Suite", price: 9000, desc: "Top luxury suite with premium services.", images: ["https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1601565415267-724db0e1e8f4?w=400&h=300&fit=crop"], type: "Presidential" },
    { name: "Penthouse Suite", price: 12000, desc: "Ultra luxury penthouse suite.", images: ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop"], type: "Penthouse" },
  ];

  // ── Helper: compute price breakdown from dates + room ──
  const computePricing = (checkIn, checkOut, room, roomCount) => {
    if (!checkIn || !checkOut || !room || roomCount === 0) return null;
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return null;
    const basePrice = room.price * roomCount * (days === 1 ? 1 : days);
    const discountApplied = days >= 6;
    const discountAmount = discountApplied ? basePrice * 0.25 : 0;
    const finalPrice = basePrice - discountAmount;
    return { days, basePrice, discountApplied, discountAmount, finalPrice };
  };

  const livePrice = computePricing(checkInVal, checkOutVal, selectedRoom, selectedRooms.length);

  const openPreview = (room) => {
    setSelectedRoom(room);
    setPreviewOpen(true);
    setSelectedRooms([]);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedRoom(null);
    setCheckInVal("");
    setCheckOutVal("");
  };

  const toggleRoomSelection = (roomNumber) => {
    if (selectedRooms.includes(roomNumber)) {
      setSelectedRooms(selectedRooms.filter((r) => r !== roomNumber));
    } else {
      setSelectedRooms([...selectedRooms, roomNumber]);
    }
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setPaymentMode("");
    setCheckInVal("");
    setCheckOutVal("");
  };

  const handleBookClick = () => {
    if (!user) { setShowLoginPopup(true); return; }
    setBookingOpen(true);
  };

  const finalizeBooking = (bookingDetails) => {
    setOnlinePaymentOpen(false);
    closeBooking();
    closePreview();
    setSuccessPopup(bookingDetails);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const pricing = computePricing(checkInVal, checkOutVal, selectedRoom, selectedRooms.length);
    if (!pricing || pricing.days <= 0) { alert("Check-out must be after Check-in"); return; }

    const bookingDetails = {
      room: selectedRoom.name,
      roomNumbers: selectedRooms,
      checkIn: checkInVal,
      checkOut: checkOutVal,
      days: pricing.days,
      paymentMode,
      basePrice: pricing.basePrice,
      discountApplied: pricing.discountApplied,
      discountAmount: pricing.discountAmount,
      price: pricing.finalPrice,
    };

    if (paymentMode === "Online") {
      setPendingBooking(bookingDetails);
      setOnlinePaymentOpen(true);
      return;
    }
    finalizeBooking(bookingDetails);
  };

  const confirmOnlinePayment = () => {
    if (!onlineMethod) { alert("Please select a payment method"); return; }
    finalizeBooking({ ...pendingBooking, onlineMethod });
  };

  const handleSuccessOkay = () => {
    navigate("/dashboard", { state: successPopup });
  };

  let filteredRooms = rooms.filter((room) => !roomType || room.type === roomType);
  if (sortOrder === "low-high") filteredRooms.sort((a, b) => a.price - b.price);
  else if (sortOrder === "high-low") filteredRooms.sort((a, b) => b.price - a.price);

  return (
    <div className="px-6 md:px-20 py-20">
      <h1 className="text-4xl font-bold text-center mb-4">Our Rooms</h1>

      {/* 🏷️ Offer banner */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm font-medium px-5 py-2.5 rounded-full">
          <span className="text-lg">🎉</span>
          <span>Book <strong>6 or more nights</strong> and get <strong>25% OFF</strong> your total!</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-10 flex flex-col md:flex-row gap-6 justify-center">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Sort by Price</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border px-3 py-2 rounded w-48">
            <option value="">Default</option>
            <option value="low-high">Low to High</option>
            <option value="high-low">High to Low</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Room Type</label>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="border px-3 py-2 rounded w-48">
            <option value="">All</option>
            {[...new Set(rooms.map((r) => r.type))].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid md:grid-cols-3 gap-10">
        {filteredRooms.map((room, index) => (
          <div key={index} onClick={() => openPreview(room)}
            className="shadow-lg rounded-xl overflow-hidden border hover:scale-105 transition cursor-pointer relative">
            {/* 25% off badge on card */}
            <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10">
              25% OFF on 6+ nights
            </div>
            <img src={room.images[0]} alt={room.name} className="w-full h-40 object-cover" />
            <div className="p-6">
              <h2 className="text-xl font-semibold">{room.name}</h2>
              <p className="text-gray-600 mt-2">{room.desc}</p>
              <p className="text-lg font-bold mt-4">₹{room.price} / night</p>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-2xl w-full relative">
            <button className="absolute top-4 right-4" onClick={closePreview}>✕</button>
            <h2 className="text-2xl font-bold mb-4">{selectedRoom.name}</h2>
            <div className="flex gap-3 mb-6">
              {selectedRoom.images.map((img, i) => (
                <img key={i} src={img} alt={`${selectedRoom.name} ${i + 1}`} className="w-40 h-28 object-cover rounded" />
              ))}
            </div>
            <p className="mb-2">{selectedRoom.desc}</p>

            {/* Offer reminder inside preview */}
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-2 rounded-lg mb-5">
              🎉 <span>Stay <strong>6+ nights</strong> and save <strong>25%</strong> on your booking!</span>
            </div>

            <h3 className="font-semibold mb-3">Available Rooms</h3>
            <div className="grid grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => {
                const roomNumber = i + 1;
                const booked = bookedRooms.includes(roomNumber);
                const selected = selectedRooms.includes(roomNumber);
                return (
                  <button key={roomNumber} disabled={booked} onClick={() => toggleRoomSelection(roomNumber)}
                    className={`p-3 rounded text-white ${booked ? "bg-red-500" : selected ? "bg-blue-600" : "bg-green-500"}`}>
                    {roomNumber}
                  </button>
                );
              })}
            </div>
            <button disabled={selectedRooms.length === 0} onClick={handleBookClick}
              className="mt-6 bg-black text-white px-6 py-2 rounded disabled:opacity-50">
              Book Selected Rooms ({selectedRooms.length})
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md relative">
            <button className="absolute top-4 right-4" onClick={closeBooking}>✕</button>
            <h2 className="text-xl font-bold mb-4">Book Rooms</h2>

            <form className="space-y-4" onSubmit={handleBookingSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Check-in Date</label>
                <input type="date" name="checkIn" required
                  value={checkInVal} onChange={(e) => setCheckInVal(e.target.value)}
                  className="w-full border p-2 rounded" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Check-out Date</label>
                <input type="date" name="checkOut" required
                  value={checkOutVal} onChange={(e) => setCheckOutVal(e.target.value)}
                  className="w-full border p-2 rounded" />
              </div>

              {/* ── Live price preview with discount ── */}
              {livePrice && (
                <div className={`rounded-xl p-4 text-sm space-y-2 ${livePrice.discountApplied ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                  <div className="flex justify-between text-gray-600">
                    <span>Duration</span>
                    <span className="font-medium">{livePrice.days} {livePrice.days === 1 ? "night" : "nights"}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Base Price</span>
                    <span className={livePrice.discountApplied ? "line-through text-gray-400" : "font-medium"}>
                      ₹{livePrice.basePrice}
                    </span>
                  </div>
                  {livePrice.discountApplied && (
                    <>
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>🎉 25% Discount Applied!</span>
                        <span>- ₹{livePrice.discountAmount}</span>
                      </div>
                      <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-green-700 text-base">
                        <span>Total Payable</span>
                        <span>₹{livePrice.finalPrice}</span>
                      </div>
                    </>
                  )}
                  {!livePrice.discountApplied && (
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800 text-base">
                      <span>Total Payable</span>
                      <span>₹{livePrice.finalPrice}</span>
                    </div>
                  )}
                  {!livePrice.discountApplied && livePrice.days < 6 && (
                    <p className="text-yellow-600 text-xs mt-1">
                      💡 Stay {6 - livePrice.days} more {6 - livePrice.days === 1 ? "night" : "nights"} to unlock 25% OFF!
                    </p>
                  )}
                </div>
              )}

              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} required className="w-full border p-2 rounded">
                <option value="">Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>

              <button type="submit" className="w-full bg-black text-white py-2 rounded">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Online Payment Modal */}
      {onlinePaymentOpen && pendingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md relative">
            <button className="absolute top-4 right-4" onClick={() => setOnlinePaymentOpen(false)}>✕</button>
            <h2 className="text-xl font-bold mb-6">Online Payment</h2>

            {/* Price breakdown in payment modal */}
            <div className={`rounded-xl p-4 text-sm space-y-2 mb-5 ${pendingBooking.discountApplied ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
              <div className="flex justify-between text-gray-600">
                <span>Base Price</span>
                <span className={pendingBooking.discountApplied ? "line-through text-gray-400" : "font-medium"}>
                  ₹{pendingBooking.basePrice}
                </span>
              </div>
              {pendingBooking.discountApplied && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>🎉 25% Discount (6+ nights)</span>
                  <span>- ₹{pendingBooking.discountAmount}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span className={pendingBooking.discountApplied ? "text-green-600" : "text-gray-800"}>
                  ₹{pendingBooking.price}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {["UPI", "Google Pay", "PhonePe", "Debit / Credit Card"].map((method) => (
                <label key={method} className="flex gap-2 items-center cursor-pointer">
                  <input type="radio" name="pay" value={method} onChange={(e) => setOnlineMethod(e.target.value)} />
                  {method}
                </label>
              ))}
            </div>
            <button onClick={confirmOnlinePayment} className="w-full bg-green-600 text-white py-2 rounded mt-6">
              Confirm Payment
            </button>
          </div>
        </div>
      )}

      {/* ✅ Success Popup */}
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
              <div className="flex justify-between">
                <span className="text-gray-500">Room</span>
                <span className="font-semibold">{successPopup.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Room No.</span>
                <span className="font-semibold">{successPopup.roomNumbers.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in</span>
                <span className="font-semibold">{successPopup.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-out</span>
                <span className="font-semibold">{successPopup.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Number of Days</span>
                <span className="font-semibold">{successPopup.days} {successPopup.days === 1 ? "night" : "nights"}</span>
              </div>

              {/* Discount row in success popup */}
              {successPopup.discountApplied && (
                <>
                  <div className="flex justify-between text-gray-500">
                    <span>Original Price</span>
                    <span className="line-through">₹{successPopup.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>🎉 25% Discount Saved</span>
                    <span>- ₹{successPopup.discountAmount}</span>
                  </div>
                </>
              )}

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Amount</span>
                <span className="text-green-600 font-bold text-lg">₹{successPopup.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment via</span>
                <span className="font-semibold">{successPopup.onlineMethod || successPopup.paymentMode}</span>
              </div>
            </div>

            <button onClick={handleSuccessOkay} className="w-full bg-black text-white py-3 rounded-xl text-base font-semibold hover:bg-gray-800 transition">
              Okay
            </button>
          </div>
        </div>
      )}

      {/* 🔒 Not Logged In Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mx-auto mb-5">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7a4 4 0 00-8 0v4H3a1 1 0 00-1 1v7a1 1 0 001 1h18a1 1 0 001-1v-7a1 1 0 00-1-1h-1V7a4 4 0 00-4-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">You're Not Logged In</h2>
            <p className="text-gray-500 text-sm mb-8">Please log in to book a room. It only takes a second!</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setShowLoginPopup(false); openSignIn(); }}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
                Login
              </button>
              <button onClick={() => setShowLoginPopup(false)}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoomsPage;