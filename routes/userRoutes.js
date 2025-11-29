import express from "express";
import { protect ,authorizeRoles, adminOnly } from "../middleware/authMiddleware.js";
import { createUser, toggleActive, changeRole, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/", protect, adminOnly, createUser);
router.get("/", protect,  getUsers);
router.put("/:id/active", protect, adminOnly, toggleActive);
router.put("/:id/role", protect, changeRole);
// GET /api/rms
// router.get("/",protect, authorizeRoles("rm") ,getRMs);

export default router;   
