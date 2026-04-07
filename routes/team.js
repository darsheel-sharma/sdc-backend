import express from "express";
import { getTeams } from "../controllers/team.js";

const router = express.Router();

router.get("/", getTeams);

export default router;
