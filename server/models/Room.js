import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: String, ref: "Hotel", required: true },
    roomType: { type: String, required: true },
    roomNumber: { type: Number, required: true, min: 1, max: 10 },
    pricePerNight: { type: Number, required: true },
    amenities: { type: Array, required: true },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// BUG FIX: was "roomtype" (lowercase) — now "roomType" to match controller usage
// Ensure a hotel cannot have duplicate roomNumber per roomType
roomSchema.index({ hotel: 1, roomType: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);
export default Room;