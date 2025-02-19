import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createEvent, getEvents, deleteEvent } from "../controllers/eventController.js";

const router = express.Router();

router.post("/", protectRoute, createEvent); // Create an event
router.get("/", protectRoute, getEvents); // Get user's events
router.delete("/:eventId", protectRoute, deleteEvent); // Delete an event

export default router;
