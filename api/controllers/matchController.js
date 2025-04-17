import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

export const swipeRight = async (req, res) => {
    try {
        const {likedUserId} = req.params;
        const currentUser = await User.findById(req.user.id);
        const likedUser = await User.findById(likedUserId);

        if(!likedUser) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        if(!currentUser.likes.includes(likedUserId)){
            currentUser.likes.push(likedUserId);
            await currentUser.save();

            if(likedUser.likes.includes(currentUser.id)){
                currentUser.matches.push(likedUser.id);
                likedUser.matches.push(currentUser.id);

                await Promise.all([
                    await currentUser.save(),
                    await likedUser.save(),
                ]);

                const connectedUsers=getConnectedUsers();
                const io = getIO();
                const likedUserSocketId=connectedUsers.get(likedUserId);
                if(likedUserSocketId) {
                    io.to(likedUserSocketId).emit("newMatch", {
                        _id: currentUser._id,
                        name: currentUser.name,
                        image: currentUser.image,
                    })
                }

                const currentSocketId = connectedUsers.get(currentUser._id.toString());
                if(currentSocketId) {
                    io.to(currentSocketId).emit("newMatch", {
                        _id: likedUser._id,
                        name: likedUser.name,
                        image: likedUser.image,
                    });
                }
            };
        };

        res.status(200).json({
            success: true,
            user: currentUser,
        });
    } catch (error) {
        console.log("Error in swipeRight: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const swipeLeft = async (req, res) => {
    try {
        const {dislikeUserId} = req.params;
        const currentUser = await User.findById(req.user.id);

        if(!currentUser.dislikes.includes(dislikeUserId)) {
            currentUser.dislikes.push(dislikeUserId);
            await currentUser.save();
        }

        res.status(200).json({
            success:true,
            user: currentUser,
        });
    } catch (error) {
        console.log("Error in swipeLeft: ", error);

        res.status(500).json({
            success:false,
            message: "Internal server error",
        });
    }
};

export const getMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("matches", "name image age bio gender genderPreference");

        res.status(200).json({
            success: true,
            matches: user.matches,
        })
    } catch (error) {
        console.log("Error in getMatches: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getUserProfiles = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        const user = await User.find({
            $and: [
                { _id: {$ne: currentUser.id} },
                { _id: {$nin: currentUser.likes} },
                { _id: {$nin: currentUser.dislikes} },
                { _id: {$nin: currentUser.matches} },
                {
                    gender: currentUser.genderPreference === "both" ? { $in: ["male", "female"]} : currentUser.genderPreference,
                },
                {genderPreference: {$in: [currentUser.gender, "both"]}}
            ],
        });

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.log("Error in getUserProfiles: ", error);

        res.status(500).json({
            success:false,
            message: "Internal server error",
        });
    }
};

// 🆕 Unmatch a User
export const unmatchUser = async (req, res) => {
    try {
        const { userIdToUnmatch } = req.params;
        const currentUser = await User.findById(req.user.id);
        const userToUnmatch = await User.findById(userIdToUnmatch);

        if (!userToUnmatch) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        // Remove each other from matches array
        currentUser.matches = currentUser.matches.filter(id => id.toString() !== userIdToUnmatch);
        userToUnmatch.matches = userToUnmatch.matches.filter(id => id.toString() !== currentUser._id.toString());

        // 🆕 Remove from likes and dislikes to reappear as potential match
        currentUser.likes = currentUser.likes.filter(id => id.toString() !== userIdToUnmatch);
        currentUser.dislikes = currentUser.dislikes.filter(id => id.toString() !== userIdToUnmatch);

        userToUnmatch.likes = userToUnmatch.likes.filter(id => id.toString() !== currentUser._id.toString());
        userToUnmatch.dislikes = userToUnmatch.dislikes.filter(id => id.toString() !== currentUser._id.toString());

        await Promise.all([currentUser.save(), userToUnmatch.save()]);

        res.status(200).json({
            success: true,
            message: "User unmatched successfully",
        });
    } catch (error) {
        console.log("Error in unmatchUser: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// 🆕 Block a User
export const blockUser = async (req, res) => {
    try {
        const { userIdToBlock } = req.params;
        const currentUser = await User.findById(req.user.id);
        const userToBlock = await User.findById(userIdToBlock);

        if (!userToBlock) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        // Remove from matches
        currentUser.matches = currentUser.matches.filter(id => id.toString() !== userIdToBlock);
        userToBlock.matches = userToBlock.matches.filter(id => id.toString() !== currentUser._id.toString());

        // Add to dislikes (prevent rematching)
        if (!currentUser.dislikes.includes(userIdToBlock)) {
            currentUser.dislikes.push(userIdToBlock);
        }

        await Promise.all([currentUser.save(), userToBlock.save()]);

        res.status(200).json({
            success: true,
            message: "User blocked successfully",
        });
    } catch (error) {
        console.log("Error in blockUser: ", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
