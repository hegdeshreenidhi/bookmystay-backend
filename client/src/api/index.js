// client/src/api/index.js
import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Creates an axios instance; pass token for protected routes
const api = (token) =>
  axios.create({
    baseURL: `${BASE}/api`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

// ── Rooms ─────────────────────────────────────────────
export const getRooms          = ()                    => api().get('/rooms');
export const getOwnerRooms     = (token)               => api(token).get('/rooms/owner');
export const createRoom        = (formData, token)     => api(token).post('/rooms', formData);
export const toggleRoomAvail   = (roomId, token)       => api(token).post(`/rooms/toggleavailability/${roomId}`);

// ── Bookings ──────────────────────────────────────────
export const createBooking     = (data, token)         => api(token).post('/bookings/book', data);
export const getUserBookings   = (token)               => api(token).get('/bookings/user');
export const getHotelBookings  = (token)               => api(token).get('/bookings/hotel');
export const checkAvailability = (data)                => api().post('/bookings/check-availability', data);

// ── User ──────────────────────────────────────────────
export const getUserData       = (token)               => api(token).get('/user');