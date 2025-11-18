import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { createUser, toggleActive, changeRole, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/", protect, adminOnly, createUser);
router.get("/", protect, adminOnly, getUsers);
router.put("/:id/active", protect, adminOnly, toggleActive);
router.put("/:id/role", protect, adminOnly, changeRole);

export default router;
