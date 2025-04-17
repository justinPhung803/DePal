import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { getMatches, getUserProfiles, swipeLeft, swipeRight, unmatchUser, blockUser  } from '../controllers/matchController.js';

const router = express.Router();

router.post("/swipe-right/:likedUserId", protectRoute, swipeRight);
router.post("/swipe-left/:dislikeUserId", protectRoute, swipeLeft);

router.get("/", protectRoute, getMatches);
router.get("/user-profiles", protectRoute, getUserProfiles);
router.delete("/unmatch/:userIdToUnmatch", protectRoute, unmatchUser); // 🆕 Unmatch route
router.delete("/block/:userIdToBlock", protectRoute, blockUser);       // 🆕 Block route


export default router;