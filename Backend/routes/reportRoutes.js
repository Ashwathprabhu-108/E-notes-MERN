import express from "express";
import { submitReport, getReports } from "../controllers/reportController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/reports", protect, submitReport);

router.get("/admin/reports", getReports);

export default router;
