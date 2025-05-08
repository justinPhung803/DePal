import express from "express";
import { createEvent, getEvents, joinEvent, leaveEvent, } from "../controllers/eventController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protectRoute, createEvent);
router.get("/", protectRoute, getEvents);
router.post("/:eventId/join", protectRoute, joinEvent);
router.post("/:eventId/leave", protectRoute, leaveEvent);

export default router;