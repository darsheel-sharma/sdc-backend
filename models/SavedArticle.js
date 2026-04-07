import mongoose from "mongoose";

const savedArticleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    url: { type: String, required: true },
    urlToImage: { type: String },
    sourceName: { type: String, required: true },
    aiSummary: { type: String },
    savedAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

savedArticleSchema.index({ userId: 1, url: 1 }, { unique: true });

const SavedArticle =
  mongoose.models.SavedArticle ||
  mongoose.model("SavedArticle", savedArticleSchema);
export default SavedArticle;
