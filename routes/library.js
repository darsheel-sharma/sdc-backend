import express from "express";
import { deleteArticle, getArticles, saveArticle } from "../controllers/library.js";

const router = express.Router();

router.post("/save-article", saveArticle);
router.delete("/delete-article", deleteArticle);
router.get("/get-articles/:userId", getArticles);
export default router;
