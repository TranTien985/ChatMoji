import express from "express";

import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriend,
  getFriendRequests,
} from "../controllers/friend.controller.js";


const router = express.Router();

router.post('/requests', sendFriendRequest);

router.post('/requests/:requestId/accept', acceptFriendRequest);

router.post('/requests/:requestId/decline', declineFriendRequest);

router.get('/', getAllFriend);

router.get('/requests', getFriendRequests)

export default router