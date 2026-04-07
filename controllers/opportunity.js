import Opportunity from "../models/Opportunity.js";
import mongoose from "mongoose";

const ALLOWED_TYPES = new Set(["hackathon", "job", "project"]);
const inMemoryOpportunities = [
  {
    _id: "local-seed-1",
    title: "BuildSprint registration open",
    desc: "Hackathon applications are live for BuildSprint. Teams of 2-4 can register before Friday midnight.",
    type: "hackathon",
    tags: ["hackathon"],
    postedBy: { name: "SDC Community Team", email: "" },
    team: [],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "local-seed-2",
    title: "Frontend internship drive",
    desc: "Job openings available for React and Next.js developers. Shortlisted candidates will get interviews this week.",
    type: "job",
    tags: ["job"],
    postedBy: { name: "Career Cell", email: "" },
    team: [],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "local-seed-3",
    title: "Need teammate for AI summarizer",
    desc: "Project team is looking for one frontend and one backend contributor for the AI summarizer MVP.",
    type: "project",
    tags: ["project"],
    postedBy: { name: "Project Board", email: "" },
    team: [],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const isMongoReady = () => mongoose.connection.readyState === 1;

const getDummyOpportunities = (typeFilter) => {
  const filtered = inMemoryOpportunities.filter((item) =>
    typeFilter ? item.type === typeFilter : true,
  );

  return filtered.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

const normalizeType = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

export const createOpportunity = async (req, res) => {
  try {
    const { title, desc, type, tags, team } = req.body;
    const normalizedType = normalizeType(type);

    if (!title || !desc || !normalizedType) {
      return res
        .status(400)
        .json({ error: "Title, description, and type are required" });
    }

    if (!ALLOWED_TYPES.has(normalizedType)) {
      return res.status(400).json({
        error: "Invalid type. Allowed values are: hackathon, job, project",
      });
    }

    if (!isMongoReady()) {
      const localOpportunity = {
        _id: `local-${Date.now()}`,
        title,
        desc,
        type: normalizedType,
        tags: tags || [],
        postedBy: { name: "You", email: "" },
        team: team || [],
        createdAt: new Date().toISOString(),
      };

      inMemoryOpportunities.unshift(localOpportunity);
      return res.status(201).json({ opportunity: localOpportunity });
    }

    const opportunity = await Opportunity.create({
      title,
      desc,
      type: normalizedType,
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
    const requestedType = normalizeType(req.query.type);
    const filters = {};

    if (requestedType && requestedType !== "all") {
      if (!ALLOWED_TYPES.has(requestedType)) {
        return res.status(400).json({
          error: "Invalid type filter. Use all, hackathon, job, or project",
        });
      }

      filters.type = requestedType;
    }

    if (!isMongoReady()) {
      const opportunities = getDummyOpportunities(filters.type);

      return res.json({ opportunities });
    }

    const opportunities = await Opportunity.find(filters)
      .populate("postedBy", "name email")
      .populate("team", "name email")
      .sort({ createdAt: -1 });

    if (opportunities.length === 0) {
      return res.json({ opportunities: getDummyOpportunities(filters.type) });
    }

    res.json({ opportunities });
  } catch (err) {
    console.error("Get Opportunities Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
