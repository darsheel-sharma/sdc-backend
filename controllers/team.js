import Team from "../models/Team.js";

export const getTeams = async (req, res) => {
  try {
    const { opportunityId } = req.query;
    const filter = {};

    if (opportunityId) {
      filter.opportunity = opportunityId;
    }

    const teams = await Team.find(filter)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .populate("opportunity", "title type tags status")
      .sort({ createdAt: -1 });

    res.json({ teams });
  } catch (err) {
    console.error("Get Teams Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
