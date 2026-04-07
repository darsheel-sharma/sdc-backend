import express from "express";
import {
  register,
  googleLogin,
  login,
  getUser,
  updateUser,
} from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/get-user", verifyToken, getUser);
router.put("/update-user", verifyToken, updateUser);
export default router;
