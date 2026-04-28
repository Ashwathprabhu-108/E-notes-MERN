// fileController.js
import { v2 as cloudinary } from "cloudinary";
import File from "../models/File.js";
import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_DOC_MIMES = new Set([
  "application/pdf",
  "application/msword",                                                        // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
  "application/vnd.ms-powerpoint",                                             // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
]);

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "thumbnail") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for thumbnail"), false);
    }
  } else if (file.fieldname === "document") {
    if (ALLOWED_DOC_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX, PPT, or PPTX files are allowed"), false);
    }
  } else {
    cb(new Error("Unexpected field"), false);
  }
};

export const upload = multer({ storage, fileFilter });

const uploadToCloudinary = (fileBuffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder, 
        resource_type: resourceType,
        type: "upload", // Ensure it's a public upload
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

export const uploadFile = async (req, res) => {
  try {
    const { title, tags, category } = req.body;
    const userId = req.user.id;

    if (!req.files || !req.files.thumbnail || !req.files.document) {
      return res.status(400).json({ message: "Thumbnail and document are required." });
    }

    const thumbnailFile = req.files.thumbnail[0];
    const documentFile = req.files.document[0];

    const thumbResult = await uploadToCloudinary(
      thumbnailFile.buffer,
      "enotes/thumbnails",
      "image"
    );

    // "raw" works for all supported doc types — Cloudinary treats non-image/video as raw
    const docResult = await uploadToCloudinary(
      documentFile.buffer,
      "enotes/documents",
      "auto"
    );

    const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);

    const newFile = await File.create({
      title,
      tags: parsedTags,
      category,
      thumbnail: {
        url: thumbResult.secure_url,
        public_id: thumbResult.public_id,
      },
      document: {
        url: docResult.secure_url,
        public_id: docResult.public_id,
        name: documentFile.originalname,
        format: docResult.format || documentFile.mimetype.split("/").pop(),
      },
      uploadedBy: userId,
    });

    res.status(201).json({
      message: "File uploaded successfully.",
      file: newFile,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed.", error: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const files = await File.find()
      .populate("uploadedBy", "username")
      .sort({ downloadCount: -1, createdAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch files.", error: error.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Increment download count
    const file = await File.findByIdAndUpdate(
      fileId,
      { $inc: { downloadCount: 1 } },
      { returnDocument: 'after' }
    );

    if (!file || !file.document) {
      return res.status(404).json({ message: "File not found." });
    }

    // Reconstruct the URL for raw file type (documents) instead of image
    // Original: https://res.cloudinary.com/dxwayqkqy/image/upload/v1777386547/enotes/documents/apupue6fdemmcakz2wve.pdf
    // Should be: https://res.cloudinary.com/dxwayqkqy/raw/upload/v1777386547/enotes/documents/apupue6fdemmcakz2wve.pdf?dl=true
    const originalUrl = file.document.url;
    const downloadUrl = originalUrl.replace('/image/upload/', '/raw/upload/') + '?dl=true';

    res.status(200).json({
      success: true,
      downloadUrl: downloadUrl,
      fileName: file.document.name,
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Download failed.", error: error.message });
  }
};