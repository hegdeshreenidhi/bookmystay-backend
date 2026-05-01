// client/src/api/index.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// ROOMS
export const getRooms    = ()         => API.get('/rooms');
export const addRoom     = (data)     => API.post('/rooms', data);
export const updateRoom  = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoom  = (id)       => API.delete(`/rooms/${id}`);

// BOOKINGS
export const getBookings    = ()         => API.get('/bookings');
export const createBooking  = (data)     => API.post('/bookings', data);
export const updateBooking  = (id, data) => API.put(`/bookings/${id}`, data);