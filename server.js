import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authroutes from "./routes/auth.js";
import opportunityRoutes from "./routes/opportunity.js";
import teamRoutes from "./routes/team.js";
import { env } from "./config/env.js";
import connectDB from "./config/mongo.js";

const app = express();
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
]);

app.use(
  cors({
    origin(origin, callback) {
      // Allow local tools and non-browser clients through without a CORS check.
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/auth", authroutes);
app.use("/opportunities", opportunityRoutes);
app.use("/teams", teamRoutes);

const startServer = async () => {
  // Hold off on accepting requests until Mongo is ready.
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Listening on ${env.PORT}`);
  });
};

process.on("SIGINT", async () => {
  // Close the Mongo connection before exiting on Ctrl+C.
  await mongoose.disconnect();
  process.exit(0);
});

startServer();
