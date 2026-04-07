import Opportunity from "../models/Opportunity.js";

export const createOpportunity = async (req, res) => {
  try {
    const { title, desc, type, tags, team } = req.body;

    if (!title || !desc || !type) {
      return res
        .status(400)
        .json({ error: "Title, description, and type are required" });
    }

    const opportunity = await Opportunity.create({
      title,
      desc,
      type,
      tags: tags || [],
      postedBy: req.userId,
      team: team || [],
    });

    res.status(201).json({ opportunity });
  } catch (err) {
    console.error("Create Opportunity Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("postedBy", "name email")
      .populate("team", "name email")
      .sort({ createdAt: -1 });

    res.json({ opportunities });
  } catch (err) {
    console.error("Get Opportunities Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
