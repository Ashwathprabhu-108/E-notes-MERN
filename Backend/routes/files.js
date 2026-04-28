import express from "express";
import { upload, uploadFile, getFiles, downloadFile } from "../controllers/fileController.js";
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

export default router;

