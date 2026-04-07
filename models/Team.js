import mongoose from "mongoose";

const { Schema } = mongoose;

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    opportunity: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

teamSchema.index({ opportunity: 1 });
teamSchema.index({ createdBy: 1, createdAt: -1 });

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);
export default Team;
