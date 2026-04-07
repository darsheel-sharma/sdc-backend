import express from "express";
import {
  createOpportunity,
  getOpportunities,
} from "../controllers/opportunity.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, createOpportunity);
router.get("/", getOpportunities);

export default router;
