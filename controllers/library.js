import SavedArticle from "../models/SavedArticle.js";

export const saveArticle = async (req, res) => {
  try {
    const { userId, article, aiSummary } = req.body;

    if (!userId || !article?.url || !article?.title || !article?.source?.name) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required article data" });
    }

    const saved = await SavedArticle.findOneAndUpdate(
      { userId, url: article.url },
      {
        $set: {
          title: article.title,
          urlToImage: article.urlToImage,
          sourceName: article.source.name,
          ...(typeof aiSummary === "string" && aiSummary.trim()
            ? { aiSummary }
            : {}),
        },
        $setOnInsert: {
          userId,
          url: article.url,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save article" });
  }
};

export const getArticles = async (req, res) => {
  try {
    const { userId } = req.params;

    const articles = await SavedArticle.find({ userId })
      .sort({ savedAt: -1 })
      .lean();

    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch library" });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { userId, url } = req.body;

    if (!userId || !url) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required article data" });
    }

    await SavedArticle.deleteOne({ userId, url });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to delete article" });
  }
};
