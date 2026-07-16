import express from "express";
import { submitReport, getReports, getMyReportStatus } from "../controllers/reportController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/reports", protect, submitReport);

router.get("/admin/reports", getReports);
router.get("/reports/my-report/:fileId", protect, getMyReportStatus);

export default router;
