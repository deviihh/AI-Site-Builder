import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./lib/prisma";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import communityRoutes from "./routes/communityRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send("Server is live");
});

app.get("/api/db-check", async (req, res) => {
  const users = await prisma.user.count();
  res.json({ message: "Database connected", users });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/community", communityRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});