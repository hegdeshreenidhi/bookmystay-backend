import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = (token) =>
  axios.create({
    baseURL: `${BASE}/api`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

// ── Rooms ──────────────────────────────────────────────
export const getRooms          = ()                        => api().get('/rooms');
export const getOwnerRooms     = (token)                   => api(token).get('/rooms/owner');
export const createRoom        = (formData, token)         => api(token).post('/rooms', formData);
// BUG FIX: was POST — now PATCH to match fixed route
export const toggleRoomAvail   = (roomId, token)           => api(token).patch(`/rooms/toggleavailability/${roomId}`);
export const deleteRoom        = (roomId, token)           => api(token).delete(`/rooms/${roomId}`);

// ── Bookings ───────────────────────────────────────────
export const createBooking     = (data, token)             => api(token).post('/bookings/book', data);
export const getUserBookings   = (token)                   => api(token).get('/bookings/user');
export const getHotelBookings  = (token)                   => api(token).get('/bookings/hotel');
export const checkAvailability = (data)                    => api().post('/bookings/check-availability', data);
// NEW: owner confirms or cancels a booking
export const updateBookingStatus = (bookingId, status, token) =>
  api(token).patch(`/bookings/${bookingId}/status`, { status });

// ── User ──────────────────────────────────────────────
export const getUserData            = (token)              => api(token).get('/user');
export const storeRecentCity        = (city, token)        => api(token).post('/user/recent-cities', { recentSearchedCity: city });