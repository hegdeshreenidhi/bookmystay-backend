import { getAuth } from "@clerk/express";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
// BUG FIX: removed bogus "import bookingRouter from '../routes/bookingRoutes.js'"

const checkAvailability = async ({ room, checkInDate, checkOutDate }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
      status: { $ne: "cancelled" },
    });
    return bookings.length === 0;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({ room, checkInDate, checkOutDate });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { room, hotel, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;

    const isAvailable = await checkAvailability({ room, checkInDate, checkOutDate });
    if (!isAvailable) {
      return res.json({ success: false, message: "Room is not available for the selected dates" });
    }

    const roomData = await Room.findById(room).populate("hotel");
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));
    const totalPrice = roomData.pricePerNight * nights;

    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      checkInDate,
      checkOutDate,
      totalPrice,
      guests: +guests,
      status: "pending", // Always starts pending — owner must confirm
    });

    res.json({ success: true, message: "Booking request sent! Awaiting owner confirmation.", booking });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to create booking" });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch user bookings" });
  }
};

export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: getAuth(req).userId });
    if (!hotel) {
      return res.json({ success: false, message: "Hotel not found for the owner" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room user hotel")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((acc, b) => acc + b.totalPrice, 0);

    const totalRooms = await Room.countDocuments({ hotel: hotel._id });

    res.json({
      success: true,
      dashboardData: { totalBookings, totalRevenue, totalRooms, bookings },
    });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch hotel bookings" });
  }
};

// NEW: Owner updates booking status (confirm / cancel)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    const hotel = await Hotel.findOne({ owner: getAuth(req).userId });
    if (!hotel) return res.json({ success: false, message: "Hotel not found" });

    const booking = await Booking.findOne({ _id: id, hotel: hotel._id });
    if (!booking) return res.json({ success: false, message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: `Booking ${status}`, booking });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};