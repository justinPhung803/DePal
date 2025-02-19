import Message from "../models/Message.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the uploads folder exists
const uploadDir = path.join(process.cwd(), 'api/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use absolute path
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage }).single("attachment");  // Change from "file" to "attachment"

export const sendMessage = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.log("Error uploading file:", err);
            return res.status(500).json({ success: false, message: "File upload failed" });
        }

        console.log("Request Body:", req.body);
        console.log("File Uploaded:", req.file); // Log the uploaded file

        try {
            const { receiverId, content } = req.body;
            const fileUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

            console.log("File URL to be saved:", fileUrl); // Debugging

            const newMessage = await Message.create({
                sender: req.user.id,
                receiver: receiverId,
                content: content || (req.file ? "[File Attachment]" : ""), 
                file: req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null, // Ensure absolute URL
            });

            console.log("Saved message:", newMessage); // Check what is actually saved

            const io = getIO();
            const connectedUsers = getConnectedUsers();
            const receiverSocketId = connectedUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", {
                    message: newMessage,
                });
            }

            res.status(201).json({
                success: true,
                message: newMessage,
            });
        } catch (error) {
            console.log("Error in sendMessage: ", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    });
};



export const getConversation = async (req, res) => {
    const {userId} = req.params;
    try {
        const messages = await Message.find({
            $or: [
                {sender: req.user._id, receiver: userId},
                {sender: userId, receiver: req.user._id}
            ]
        }).sort("createdAt")

        res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        console.log("Error in getConversation: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};