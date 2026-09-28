import express from "express";
import {
  createProject,
  getProject,
  getProjects,
  makeRevision,
  rollbackToVersion,
  togglePublish,
  deleteProject,
} from "../controllers/projectController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.get("/:projectId", protect, getProject);
router.delete("/:projectId", protect, deleteProject);
router.post("/:projectId/revisions", protect, makeRevision);
router.post("/:projectId/rollback/:versionId", protect, rollbackToVersion);
router.post("/:projectId/publish", protect, togglePublish);

export default router;