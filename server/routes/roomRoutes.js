import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRoom, getOwnerRooms, getRooms, toggleRoomAvailability, deleteRoom } from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.post("/", upload.array("images", 4), protect, createRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/owner", protect, getOwnerRooms);
// BUG FIX: was POST /toggleavailability/:roomId with roomId in req.body — now PATCH with param
roomRouter.patch("/toggleavailability/:roomId", protect, toggleRoomAvailability);
roomRouter.delete("/:roomId", protect, deleteRoom);

export default roomRouter;