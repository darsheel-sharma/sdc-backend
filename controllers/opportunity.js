import Opportunity from "../models/Opportunity.js";
import Team from "../models/Team.js";

export const createOpportunity = async (req, res) => {
  try {
    const { title, desc, description, type, status, maxMembers, tags, team } =
      req.body;

    // Accept either desc or description from the frontend.
    const descriptionText = desc || description;
    const normalizedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];
    const normalizedStatus =
      typeof status === "string" && status.trim()
        ? status.trim().toLowerCase()
        : "open";
    const parsedMaxMembers = Number(maxMembers);

    if (!title || !descriptionText || !type || maxMembers === undefined) {
      return res.status(400).json({
        error: "Title, description, type, and maxMembers are required",
      });
    }

    if (!["open", "closed"].includes(normalizedStatus)) {
      return res
        .status(400)
        .json({ error: "Status must be either open or closed" });
    }

    if (!Number.isInteger(parsedMaxMembers) || parsedMaxMembers < 1) {
      return res
        .status(400)
        .json({ error: "maxMembers must be a positive integer" });
    }

    // Save the opportunity first so the optional team can point back to it.
    const opportunity = await Opportunity.create({
      title,
      desc: descriptionText,
      type,
      status: normalizedStatus,
      maxMembers: parsedMaxMembers,
      tags: normalizedTags,
      postedBy: req.userId,
    });

    let createdTeam = null;

    if (typeof team === "string" && team.trim()) {
      // Support sending just a team name for quick creation.
      createdTeam = await Team.create({
        name: team.trim(),
        opportunity: opportunity._id,
        createdBy: req.userId,
      });

      opportunity.team = createdTeam._id;
      await opportunity.save();
    } else if (team && typeof team === "object" && team.name) {
      // Or accept the fuller team payload when it's already assembled.
      createdTeam = await Team.create({
        name: team.name,
        bio: team.bio,
        members: Array.isArray(team.members) ? team.members : [],
        opportunity: opportunity._id,
        createdBy: req.userId,
      });

      opportunity.team = createdTeam._id;
      await opportunity.save();
    }

    const populatedOpportunity = await Opportunity.findById(opportunity._id)
      .populate("postedBy", "name email")
      .populate({
        path: "team",
        populate: { path: "members", select: "name email" },
      });

    res.status(201).json({
      opportunity: populatedOpportunity,
      team: createdTeam,
    });
  } catch (err) {
    console.error("Create Opportunity Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getOpportunities = async (req, res) => {
  try {
    const { tag, status } = req.query;
    const filter = {};

    // Query params come in as strings, so normalize before filtering.
    if (tag) {
      filter.tags = tag.toString().trim().toLowerCase();
    }

    if (status) {
      filter.status = status.toString().trim().toLowerCase();
    }

    const opportunities = await Opportunity.find(filter)
      .populate("postedBy", "name email")
      .populate({
        path: "team",
        populate: { path: "members", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json({ opportunities });
  } catch (err) {
    console.error("Get Opportunities Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
