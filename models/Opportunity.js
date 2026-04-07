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
    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["hackathon", "job", "project"],
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
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
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

const Opportunity =
  mongoose.models.Opportunity ||
  mongoose.model("Opportunity", opportunitySchema);
export default Opportunity;
