import mongoose from "mongoose";

const { Schema } = mongoose;

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    desc: {
      type: String,
      required: true,
      trim: true,
      alias: "description",
    },
    type: { type: String, required: true, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      trim: true,
      lowercase: true,
    },
    maxMembers: {
      type: Number,
      required: true,
      min: 1,
    },
    tags: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

opportunitySchema.index({ postedBy: 1, createdAt: -1 });
opportunitySchema.index({ type: 1, createdAt: -1 });
opportunitySchema.index({ tags: 1 });

const Opportunity =
  mongoose.models.Opportunity ||
  mongoose.model("Opportunity", opportunitySchema);
export default Opportunity;
