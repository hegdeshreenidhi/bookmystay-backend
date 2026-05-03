import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";
// BUG FIX: removed bogus "import { json } from 'express'" — json is not an export of express

export const createRoom = async (req, res) => {
  try {
    const { roomType, roomNumber, pricePerNight, amenities } = req.body;
    const hotel = await Hotel.findOne({ owner: req.auth.userId });

    if (!hotel) return res.json({ success: false, message: "Hotel not found" });

    // Enforce max 10 rooms per type
    const existingCount = await Room.countDocuments({ hotel: hotel._id, roomType });
    if (existingCount >= 10) {
      return res.json({ success: false, message: `Maximum 10 rooms allowed per room type. ${roomType} already has ${existingCount} rooms.` });
    }

    // Check roomNumber is not already taken for this type
    const duplicate = await Room.findOne({ hotel: hotel._id, roomType, roomNumber: +roomNumber });
    if (duplicate) {
      return res.json({ success: false, message: `Room number ${roomNumber} already exists for ${roomType}.` });
    }

    // Upload images to Cloudinary
    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });
    const images = await Promise.all(uploadImages);

    // BUG FIX: was json.parse(amenities) — must be JSON.parse
    await Room.create({
      hotel: hotel._id,
      roomType,
      roomNumber: +roomNumber,
      pricePerNight: +pricePerNight,
      amenities: JSON.parse(amenities),
      images,
    });

    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: "hotel",
        populate: { path: "owner", select: "image" },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getOwnerRooms = async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotelData) return res.json({ success: false, message: "No hotel found for this owner" });

    const rooms = await Room.find({ hotel: hotelData._id.toString() })
      .populate("hotel")
      .sort({ roomType: 1, roomNumber: 1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// BUG FIX: was reading roomId from req.body but route uses :roomId param
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomData = await Room.findById(roomId);
    if (!roomData) return res.json({ success: false, message: "Room not found" });
    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();
    res.json({ success: true, message: "Room availability updated successfully", isAvailable: roomData.isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) return res.json({ success: false, message: "Hotel not found" });

    const room = await Room.findOne({ _id: roomId, hotel: hotel._id });
    if (!room) return res.json({ success: false, message: "Room not found or not yours" });

    await Room.findByIdAndDelete(roomId);
    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};