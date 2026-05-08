import express from "express";
import { upload, uploadFile, getFiles, downloadFile, saveFile, unsaveFile } from "../controllers/fileController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  uploadFile
);

router.get("/", getFiles);

router.get("/download/:fileId", downloadFile);

router.post("/save/:fileId", protect, saveFile);

router.post("/unsave/:fileId", protect, unsaveFile);

// TEMP DEBUG ROUTE - remove after
router.get("/debug/:fileId", async (req, res) => {
  const File = (await import("../models/File.js")).default;
  const file = await File.findById(req.params.fileId);
  res.json(file?.document || { error: "not found" });
});

export default router;

