import express from "express";
import {
  createOpportunity,
  getOpportunities,
} from "../controllers/opportunity.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getOpportunities);
router.post("/", verifyToken, createOpportunity);

export default router;
