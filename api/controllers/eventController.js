import Event from "../models/Event.js";
import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

// ✅ Create an event
export const createEvent = async (req, res) => {
    try {
        const { title, description, startTime, endTime, location } = req.body;
        const creator = req.user.id; // Logged-in user

        // Get matched users
        const user = await User.findById(creator);
        const attendees = user.matches;

        const event = await Event.create({ creator, title, description, startTime, endTime, location, attendees });

        // Notify matched users via WebSockets
        const connectedUsers = getConnectedUsers();
        const io = getIO();
        attendees.forEach((attendeeId) => {
            const socketId = connectedUsers.get(attendeeId.toString());
            if (socketId) {
                io.to(socketId).emit("newEvent", event);
            }
        });

        res.status(201).json({ success: true, event });
    } catch (error) {
        console.error("Error in createEvent:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Get all events for a user (including matched users' events)
export const getEvents = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find events created by user or their matched users
        const events = await Event.find({
            $or: [{ creator: userId }, { attendees: userId }]
        }).populate("creator", "name image");

        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error("Error in getEvents:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Delete an event
export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Only the creator can delete it
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await event.deleteOne();
        res.status(200).json({ success: true, message: "Event deleted" });
    } catch (error) {
        console.error("Error in deleteEvent:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
