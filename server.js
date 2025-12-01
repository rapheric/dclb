import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import checklistRoutes from "./routes/checklistRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/checklist", checklistRoutes);
// RM routes
app.use("/api/rms", userRoutes);

app.listen(process.env.PORT || 5000, () =>
  console.log(`✅ Server running on port ${process.env.PORT}`)
);
