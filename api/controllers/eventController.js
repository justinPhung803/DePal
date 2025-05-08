import Event from "../models/Event.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

const sendNotificationToCreator = async (creatorId, sender, eventTitle, action) => {
    const content = `${sender.name} has ${action} your event "${eventTitle}".`;

    const newMessage = await Message.create({
        sender: sender._id,
        receiver: creatorId,
        content,
    });

    const io = getIO();
    const connectedUsers = getConnectedUsers();
    const creatorSocketId = connectedUsers.get(creatorId.toString());

    if (creatorSocketId) {
        io.to(creatorSocketId).emit("newMessage", { message: newMessage });
    }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, location } = req.body;
    const creator = req.user.id;

    const newEvent = await Event.create({
      creator,
      title,
      description,
      startTime,
      endTime,
      location,
    });

    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getEvents = async (req, res) => {
    try {
      const currentUserId = req.user._id.toString();
      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }
      console.log("Fetching events for user:", req.user);

      const user = await User.findById(currentUserId);
  
      const matchIds = user.matches.map(id => id.toString());
  
      const events = await Event.find({
        $or: [
          { creator: currentUserId },
          { creator: { $in: matchIds } }
        ]
      }).populate("creator", "name").populate("attendees", "name _id");
  
      res.status(200).json({ success: true, events });
    } catch (error) {
      console.error("Error getting events:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  export const joinEvent = async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const userId = req.user._id;
      const userName = req.user.name;
  
      const event = await Event.findById(eventId).populate("creator");
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
  
      const alreadyJoined = event.attendees.some(id => id.toString() === userId.toString());
      if (!alreadyJoined) {
        event.attendees.push(userId);
        await event.save();
  
        // ✅ Send message to the creator
        const newMessage = await Message.create({
          sender: userId,
          receiver: event.creator._id,
          content: `${userName} has joined your event: ${event.title}`,
        });
  
        const io = getIO();
        const connectedUsers = getConnectedUsers();
        const creatorSocketId = connectedUsers.get(event.creator._id.toString());
        if (creatorSocketId) {
          console.log("📢 Emitting socket to creator:", creatorSocketId);
          io.to(creatorSocketId).emit("newMessage", { message: newMessage });
        }
        const updatedEvent = await Event.findById(eventId)
            .populate("creator", "name")
            .populate("attendees", "name _id");

            const uniqueUserIds = new Set([
                updatedEvent.creator._id.toString(),
                ...updatedEvent.attendees.map(a => a._id.toString())
              ]);
              
              for (const userId of uniqueUserIds) {
                const socketId = connectedUsers.get(userId);
                if (socketId) {
                  console.log(`📢 Sending eventUpdated to user: ${userId}`);
                  io.to(socketId).emit("eventUpdated", {
                    eventId: updatedEvent._id,
                    attendees: updatedEvent.attendees,
                  });
                }
              }
      }
  
      res.status(200).json({ success: true, message: "Joined event", event });
    } catch (error) {
      console.error("Error joining event:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
  export const leaveEvent = async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const userId = req.user._id;
      const userName = req.user.name;
  
      const event = await Event.findById(eventId).populate("creator");
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
  
      const beforeCount = event.attendees.length;
      event.attendees = event.attendees.filter(attendeeId => attendeeId.toString() !== userId.toString());
      if (event.attendees.length < beforeCount) {
        await event.save();
  
        // ✅ Send message to the creator
        const newMessage = await Message.create({
          sender: userId,
          receiver: event.creator._id,
          content: `${userName} has left your event: ${event.title}`,
        });
  
        const io = getIO();
        const connectedUsers = getConnectedUsers();
        const creatorSocketId = connectedUsers.get(event.creator._id.toString());
        if (creatorSocketId) {
          console.log("📢 Emitting socket to creator:", creatorSocketId);
          io.to(creatorSocketId).emit("newMessage", { message: newMessage });
          
        }
        const updatedEvent = await Event.findById(eventId)
            .populate("creator", "name")
            .populate("attendees", "name _id");

        const uniqueUserIds = new Set([
            updatedEvent.creator._id.toString(),
            ...updatedEvent.attendees.map(a => a._id.toString())
        ]);
        
        for (const userId of uniqueUserIds) {
            const socketId = connectedUsers.get(userId);
            if (socketId) {
                console.log(`📢 Sending eventUpdated to user: ${userId}`);
                io.to(socketId).emit("eventUpdated", {
                    eventId: updatedEvent._id,
                    attendees: updatedEvent.attendees,
                });
            }
        }
      }
  
      res.status(200).json({ success: true, message: "Left event", event });
    } catch (error) {
      console.error("Error leaving event:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };