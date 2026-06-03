import express from "express";
import jwt from "jsonwebtoken";
import verifyAdminToken from "../middleware/adminMiddleware.js";
import User from "../models/User.js";
import File from "../models/File.js";
import Report from "../models/Report.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// ========== ADMIN LOGIN ==========
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check credentials against .env
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ role: "admin" }, process.env.ADMIN_JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ========== GET ALL USERS ==========
router.get("/admin/users", verifyAdminToken, async (req, res) => {
  try {
    const users = await User.find()
      .select("_id username email isDisabled myFiles createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Transform to include file count
    const usersWithFileCount = users.map((user) => ({
      ...user,
      filesCount: user.myFiles?.length || 0,
      myFiles: undefined,
    }));

    return res.status(200).json(usersWithFileCount);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ========== TOGGLE USER DISABLE ==========
router.patch("/admin/users/:userId/disable", verifyAdminToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle isDisabled
    user.isDisabled = !user.isDisabled;
    await user.save();

    return res.status(200).json({
      message: `User ${user.isDisabled ? "disabled" : "enabled"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Toggle user disable error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ========== DELETE USER ==========
router.delete("/admin/users/:userId", verifyAdminToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all files uploaded by this user
    const userFiles = await File.find({ uploadedBy: userId });

    // Delete files from Cloudinary and MongoDB
    for (const file of userFiles) {
      // Delete thumbnail from Cloudinary
      if (file.thumbnail?.public_id) {
        await cloudinary.uploader.destroy(file.thumbnail.public_id);
      }

      // Delete document from Cloudinary
      if (file.document?.public_id) {
        await cloudinary.uploader.destroy(file.document.public_id);
      }

      // Delete file from MongoDB
      await File.findByIdAndDelete(file._id);

      // Delete associated reports
      await Report.deleteMany({ reportedFile: file._id });
    }

    // Remove user from other users' savedFiles and downloads
    await User.updateMany(
      {},
      {
        $pull: {
          savedFiles: { $in: userFiles.map((f) => f._id) },
          downloads: { $in: userFiles.map((f) => f._id) },
        },
      }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "User and all associated data deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ========== GET USER FILES ==========
router.get("/admin/users/:userId/files", verifyAdminToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const files = await File.find({ uploadedBy: userId })
      .select("_id title category document thumbnail downloadCount createdAt")
      .lean();

    // Get report counts for each file
    const filesWithReports = await Promise.all(
      files.map(async (file) => {
        const reportCount = await Report.countDocuments({ reportedFile: file._id });
        return {
          ...file,
          format: file.document?.format || "unknown",
          thumbnail: file.thumbnail?.url || null,
          reportCount,
          document: undefined,
        };
      })
    );

    return res.status(200).json(filesWithReports);
  } catch (error) {
    console.error("Get user files error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ========== DELETE FILE ==========
router.delete("/admin/files/:fileId", verifyAdminToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete from Cloudinary
    if (file.thumbnail?.public_id) {
      await cloudinary.uploader.destroy(file.thumbnail.public_id);
    }

    if (file.document?.public_id) {
      await cloudinary.uploader.destroy(file.document.public_id);
    }

    // Remove from all users' savedFiles and downloads
    await User.updateMany(
      {},
      {
        $pull: {
          savedFiles: fileId,
          downloads: fileId,
        },
      }
    );

    // Delete all reports for this file
    await Report.deleteMany({ reportedFile: fileId });

    // Delete file from MongoDB
    await File.findByIdAndDelete(fileId);

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ========== GET FILE REPORTS ==========
router.get("/admin/files/:fileId/reports", verifyAdminToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const reports = await Report.find({ reportedFile: fileId })
      .populate("reportedBy", "username email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(reports);
  } catch (error) {
    console.error("Get file reports error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ========== UPDATE REPORT STATUS ==========
router.patch("/admin/reports/:reportId/status", verifyAdminToken, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!["pending", "reviewed", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("Update report status error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ========== GET ADMIN STATS ==========
router.get("/admin/stats", verifyAdminToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await File.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });

    // Calculate total downloads
    const filesWithDownloads = await File.find().select("downloadCount").lean();
    const totalDownloads = filesWithDownloads.reduce(
      (sum, file) => sum + (file.downloadCount || 0),
      0
    );

    return res.status(200).json({
      totalUsers,
      totalFiles,
      totalDownloads,
      totalReports,
      pendingReports,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
