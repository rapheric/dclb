import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// import checklistRoutes from "./routes/checklistRoutes.js";
// import morgan from "morgan";
import path from "path";
import coCreatorRoutes from "./routes/cocreatorRoutes.js";
// import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] })
);

app.use(express.json());

//
// serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api/checklist", coCreatorRoutes);

// 404 + error handler
// app.use(notFound);
// app.use(errorHandler);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/checklist", checklistRoutes);

// RM routes
app.use("/api/rms", userRoutes);

app.listen(process.env.PORT || 8000, () =>
  console.log(`✅ Server running on port ${process.env.PORT}`)
);
