import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authroutes from "./routes/auth.js";
import opportunityRoutes from "./routes/opportunity.js";
import teamRoutes from "./routes/team.js";
import { env } from "./config/env.js";
import connectDB from "./config/mongo.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/auth", authroutes);
app.use("/opportunities", opportunityRoutes);
app.use("/teams", teamRoutes);

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Listening on ${env.PORT}`);
  });
};

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit(0);
});

startServer();
