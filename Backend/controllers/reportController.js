import Report from "../models/Report.js";
import { emitStatsUpdate } from "../statsEmitter.js";

// GET /api/reports/my-report/:fileId - Get current user's report status for a file
export const getMyReportStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fileId } = req.params;

    const report = await Report.findOne({ reportedFile: fileId, reportedBy: userId })
      .select("status createdAt");

    if (!report) {
      return res.status(200).json({ reported: false });
    }

    return res.status(200).json({ reported: true, status: report.status });
  } catch (error) {
    console.error("Get my report status error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/reports - Submit a report
export const submitReport = async (req, res) => {
  try {
    const { fileId, reason, description } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!fileId || !reason) {
      return res.status(400).json({ message: "fileId and reason are required" });
    }

    // Check if user already reported this file
    const existingReport = await Report.findOne({
      reportedFile: fileId,
      reportedBy: userId,
    });

    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this file" });
    }

    // Create new report
    const newReport = new Report({
      reportedFile: fileId,
      reportedBy: userId,
      reason,
      description: description || null,
    });

    await newReport.save();

    // Emit real-time stats update to admin dashboard
    emitStatsUpdate().catch(() => {});

    return res.status(201).json({ message: "Report submitted successfully" });
  } catch (error) {
    console.error("Report submission error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/admin/reports - Get all reports (for admin later)
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate({
        path: "reportedFile",
        select: "title format uploadedBy",
        populate: {
          path: "uploadedBy",
          select: "username email",
        },
      })
      .populate("reportedBy", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json(reports);
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
