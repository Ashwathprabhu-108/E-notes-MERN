// fileController.js
import { v2 as cloudinary } from "cloudinary";
import File from "../models/File.js";
import multer from "multer";
import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";
import { createRequire } from "module";


const require = createRequire(import.meta.url);
const officeparser = require("officeparser");

// officeparser: use parseOffice (callback-based), wrap in promise
const parseOfficeToPText = async (filePath) => {
  const ast = await officeparser.parseOffice(filePath);
  return ast.toText() || "";
};

// pdf-parse: the actual parse function is pdfParseLib.PDFParse
const parsePdf = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      const PdfReader = pdfParseLib.PDFParse;
      const instance = new PdfReader({ verbosity: -1 });
      instance.load({ data: new Uint8Array(buffer) })
        .then(() => instance.getText())
        .then(text => resolve({ text: text || "" }))
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
};

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

const formatMap = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
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
        format: formatMap[documentFile.mimetype] || "pdf",
      },
      uploadedBy: userId,
    });

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

    if (userId) {
      const User = (await import("../models/User.js")).default;
      User.findByIdAndUpdate(userId, { $addToSet: { downloads: fileId } }).catch(console.error);
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
    if (!file) return res.status(404).json({ message: "File not found." });

    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.savedFiles.some((id) => id.toString() === fileId)) {
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
    if (!file) return res.status(404).json({ message: "File not found." });

    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.savedFiles = user.savedFiles.filter((id) => id.toString() !== fileId);
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
    const files = await File.find({ uploadedBy: userId }).sort({ createdAt: -1 });
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
    if (!file) return res.status(404).json({ message: "File not found." });

    if (file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ message: "You do not have permission to delete this file." });
    }

    if (file.thumbnail?.public_id) {
      try { await cloudinary.uploader.destroy(file.thumbnail.public_id); } catch (err) { console.error(err); }
    }
    if (file.document?.public_id) {
      try { await cloudinary.uploader.destroy(file.document.public_id); } catch (err) { console.error(err); }
    }

    await File.findByIdAndDelete(fileId);

    const User = (await import("../models/User.js")).default;
    await User.updateMany({ myFiles: fileId }, { $pull: { myFiles: fileId } });
    await User.updateMany({ savedFiles: fileId }, { $pull: { savedFiles: fileId } });

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
    if (!file) return res.status(404).json({ message: "File not found." });

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
      { returnDocument: "after" }
    );

    res.status(200).json({ message: "File updated successfully.", file: updatedFile });
  } catch (error) {
    console.error("Update file error:", error);
    res.status(500).json({ message: "Failed to update file.", error: error.message });
  }
};

export const getMyDownloads = async (req, res) => {
  try {
    const userId = req.user.id;
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId).populate({
      path: "downloads",
      populate: { path: "uploadedBy", select: "username" }
    });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user.downloads || []);
  } catch (error) {
    console.error("Get downloads error:", error);
    res.status(500).json({ message: "Failed to fetch downloads.", error: error.message });
  }
};

export const getFilePreview = async (req, res) => {
  try {
    const { fileId } = req.params;

    // STEP 1: Fetch file from MongoDB
    const file = await File.findById(fileId).populate("uploadedBy", "username");
    if (!file || !file.document?.url) {
      return res.status(404).json({ message: "File not found." });
    }

    const format = file.document.format?.toLowerCase() || "pdf";

    // STEP 2: Return cached summary if exists
    if (file.summary?.content) {
      try {
        const parsedSummary = JSON.parse(file.summary.content);
        return res.status(200).json({
          fileId: file._id,
          title: file.title,
          format,
          uploadedBy: file.uploadedBy?.username,
          downloadCount: file.downloadCount,
          summary: {
            overview: parsedSummary.overview || "Preview not available for this file.",
            mainTopics: parsedSummary.mainTopics || [],
            keyPoints: parsedSummary.keyPoints || [],
            difficultyLevel: parsedSummary.difficultyLevel || "Unknown",
          },
          isCached: true,
        });
      } catch (parseErr) {
        console.warn("Could not parse cached summary:", parseErr.message);
      }
    }

    // STEP 3: Fetch file buffer from Cloudinary
    let extractedText = "";
    try {
      const cloudinaryResponse = await fetch(file.document.url);
      if (!cloudinaryResponse.ok) throw new Error("Failed to fetch file from Cloudinary");
      const fileBuffer = Buffer.from(await cloudinaryResponse.arrayBuffer());

      // STEP 4: Extract text based on format
      if (format === "pdf") {
        const tempFilePath = path.join(os.tmpdir(), `enotes_${Date.now()}.pdf`);
        try {
          console.log("[Preview] Attempting PDF extraction...");
          fs.writeFileSync(tempFilePath, fileBuffer);
          const ast = await officeparser.parseOffice(tempFilePath);
          extractedText = (ast.toText() || "").trim();
          console.log("[Preview] PDF extracted:", extractedText.length, "characters");
        } catch (pdfErr) {
          console.warn("PDF text extraction failed:", pdfErr.message);
        } finally {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        }
      } else if (format === "docx" || format === "doc") {
        try {
          console.log("[Preview] Attempting DOCX/DOC extraction...");
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = (result.value || "").trim();
          console.log("[Preview] DOCX/DOC extracted:", extractedText.length, "characters");
        } catch (docErr) {
          console.warn("DOCX/DOC text extraction failed:", docErr.message);
        }
      } else if (format === "pptx" || format === "ppt") {
        const tempFilePath = path.join(os.tmpdir(), `enotes_${Date.now()}.pptx`);
        try {
          console.log("[Preview] Attempting PPT/PPTX extraction...");
          fs.writeFileSync(tempFilePath, fileBuffer);
          extractedText = (await parseOfficeToPText(tempFilePath)).trim();
          console.log("[Preview] PPT/PPTX extracted:", extractedText.length, "characters");
        } catch (pptErr) {
          console.warn("PPT/PPTX text extraction failed:", pptErr.message);
        } finally {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        }
      }

      // Limit to 3000 characters
      extractedText = extractedText.substring(0, 3000).trim();
      console.log("[Preview] Final extracted text:", extractedText.length, "characters");

      if (!extractedText) {
        throw new Error("No text could be extracted from the file");
      }

      // STEP 5: Send to Gemini
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not configured");

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are a helpful study assistant. Analyze these academic notes and provide:
1. A brief overview (2-3 sentences)
2. Main topics covered (as a list)
3. Key points to remember (5-7 bullet points)
4. Difficulty level (Beginner/Intermediate/Advanced)

Format your response as JSON with these exact keys:
overview, mainTopics (array), keyPoints (array), difficultyLevel

Notes content: ${extractedText}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      let summaryData = {
        overview: "Preview not available for this file.",
        mainTopics: [],
        keyPoints: [],
        difficultyLevel: "Unknown",
      };

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          summaryData = {
            overview: parsedResponse.overview || summaryData.overview,
            mainTopics: Array.isArray(parsedResponse.mainTopics) ? parsedResponse.mainTopics : [],
            keyPoints: Array.isArray(parsedResponse.keyPoints) ? parsedResponse.keyPoints : [],
            difficultyLevel: parsedResponse.difficultyLevel || summaryData.difficultyLevel,
          };
        }
      } catch (jsonErr) {
        console.warn("Could not parse Gemini response as JSON:", jsonErr.message);
      }

      // STEP 6: Cache summary in MongoDB
      file.summary = {
        content: JSON.stringify(summaryData),
        generatedAt: new Date(),
      };
      await file.save();

      // STEP 7: Return response
      return res.status(200).json({
        fileId: file._id,
        title: file.title,
        format,
        uploadedBy: file.uploadedBy?.username,
        downloadCount: file.downloadCount,
        summary: summaryData,
        isCached: false,
      });
    } catch (textExtractionErr) {
      console.warn("Text extraction or Gemini call failed:", textExtractionErr.message);

      return res.status(200).json({
        fileId: file._id,
        title: file.title,
        format,
        uploadedBy: file.uploadedBy?.username,
        downloadCount: file.downloadCount,
        summary: {
          overview: "Preview not available for this file.",
          mainTopics: [],
          keyPoints: [],
          difficultyLevel: "Unknown",
        },
        isCached: false,
      });
    }
  } catch (error) {
    console.error("Get preview error:", error);
    return res.status(200).json({
      fileId: req.params.fileId || "unknown",
      title: "Unknown",
      format: "unknown",
      summary: {
        overview: "Preview not available for this file.",
        mainTopics: [],
        keyPoints: [],
        difficultyLevel: "Unknown",
      },
      isCached: false,
    });
  }
};