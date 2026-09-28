import express from "express";
import { getPublishedProjects, getPublishedProject } from "../controllers/projectController";

const router = express.Router();

// Public routes: no login needed
router.get("/", getPublishedProjects);
router.get("/:projectId", getPublishedProject);

export default router;