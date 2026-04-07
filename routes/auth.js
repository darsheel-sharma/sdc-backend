import express from "express";
import {
  register,
  googleLogin,
  login,
  updateUser,
  getCurrentUser,
} from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/me", verifyToken, getCurrentUser);
router.get("/get-user", verifyToken, getCurrentUser);
router.put("/update-user", verifyToken, updateUser);
export default router;
