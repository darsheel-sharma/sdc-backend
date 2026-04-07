import express from "express";
import { register, googleLogin, login, getUser } from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/get-user", verifyToken, getUser);
export default router;
