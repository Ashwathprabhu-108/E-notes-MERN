// fileController.js
import { v2 as cloudinary } from "cloudinary";
import File from "../models/File.js";
import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_DOC_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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

// ✅ Helper — must be defined before downloadFile
const getContentType = (format) => {
  const contentTypeMap = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
  };
  return contentTypeMap[format?.toLowerCase()] || "application/octet-stream";
};

const uploadToCloudinary = (fileBuffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        type: "upload",
        access_mode: "public",
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

    const docResult = await uploadToCloudinary(
      documentFile.buffer,
      "enotes/documents",
      "raw"
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

    // Add file to user's myFiles
    const User = (await import("../models/User.js")).default;
    await User.findByIdAndUpdate(userId, { $push: { myFiles: newFile._id } });

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
    const userId = req.user?.id;

    const file = await File.findById(fileId);
    if (!file || !file.document?.url) {
      return res.status(404).json({ message: "File not found." });
    }

    File.findByIdAndUpdate(fileId, { $inc: { downloadCount: 1 } }).catch(console.error);

    // Track download for authenticated users (add if not already present)
    if (userId) {
      const User = (await import("../models/User.js")).default;
      User.findByIdAndUpdate(
        userId,
        { $addToSet: { downloads: fileId } }
      ).catch(console.error);
    }

    const fileName = file.document.name || "download";
    const format = file.document.format;
    const contentType = getContentType(format);

    console.log("[Download] URL:", file.document.url);
    console.log("[Download] format:", format);

    const cloudinaryResponse = await fetch(file.document.url);
    console.log("[Download] Cloudinary status:", cloudinaryResponse.status);

    if (!cloudinaryResponse.ok) {
      const errText = await cloudinaryResponse.text();
      console.error("[Download] Cloudinary error:", errText);
      return res.status(502).json({ message: "Failed to retrieve file from storage." });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const contentLength = cloudinaryResponse.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);

    const buffer = await cloudinaryResponse.arrayBuffer();
    res.end(Buffer.from(buffer));

  } catch (error) {
    console.error("[Download] CRASH:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: "Download failed.", error: error.message });
    }
  }
};

export const saveFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.savedFiles.some(id => id.toString() === fileId)) {
      user.savedFiles.push(fileId);
      await user.save();
    }

    res.status(200).json({ message: "File saved successfully.", isSaved: true });
  } catch (error) {
    console.error("Save file error:", error);
    res.status(500).json({ message: "Failed to save file.", error: error.message });
  }
};

export const unsaveFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.savedFiles = user.savedFiles.filter(id => id.toString() !== fileId);
    await user.save();

    res.status(200).json({ message: "File unsaved successfully.", isSaved: false });
  } catch (error) {
    console.error("Unsave file error:", error);
    res.status(500).json({ message: "Failed to unsave file.", error: error.message });
  }
};

export const getMyFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const files = await File.find({ uploadedBy: userId })
      .sort({ createdAt: -1 });

    res.status(200).json(files);
  } catch (error) {
    console.error("Get my files error:", error);
    res.status(500).json({ message: "Failed to fetch your files.", error: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    // Check if user owns this file
    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ message: "You do not have permission to delete this file." });
    }

    // Delete from Cloudinary
    if (file.thumbnail?.public_id) {
      try {
        await cloudinary.uploader.destroy(file.thumbnail.public_id);
      } catch (err) {
        console.error("Error deleting thumbnail from Cloudinary:", err);
      }
    }

    if (file.document?.public_id) {
      try {
        await cloudinary.uploader.destroy(file.document.public_id);
      } catch (err) {
        console.error("Error deleting document from Cloudinary:", err);
      }
    }

    // Delete from database
    await File.findByIdAndDelete(fileId);

    // Remove from user's myFiles and savedFiles
    const User = (await import("../models/User.js")).default;
    await User.updateMany(
      { myFiles: fileId },
      { $pull: { myFiles: fileId } }
    );
    await User.updateMany(
      { savedFiles: fileId },
      { $pull: { savedFiles: fileId } }
    );

    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: "Failed to delete file.", error: error.message });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { title, tags, category } = req.body;
    const userId = req.user.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    // Check if user owns this file
    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ message: "You do not have permission to edit this file." });
    }

    const parsedTags = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : file.tags;

    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      {
        title: title || file.title,
        tags: parsedTags,
        category: category || file.category,
      },
      { returnDocument: 'after' }
    );

    res.status(200).json({
      message: "File updated successfully.",
      file: updatedFile,
    });
  } catch (error) {
    console.error("Update file error:", error);
    res.status(500).json({ message: "Failed to update file.", error: error.message });
  }
};

export const getMyDownloads = async (req, res) => {
  try {
    const userId = req.user.id;

    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId).populate('downloads');

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user.downloads || []);
  } catch (error) {
    console.error("Get downloads error:", error);
    res.status(500).json({ message: "Failed to fetch downloads.", error: error.message });
  }
};