import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Upload.css";
import UploadIcon from "../../assets/Upload.svg";

const categories = [
  "Academic",
  "Technology",
  "Business",
  "Science",
  "Arts & Humanities",
  "Law",
  "Medical",
  "Other",
];

const ACCEPTED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ACCEPTED_DOC_EXTENSIONS = ".pdf,.doc,.docx,.ppt,.pptx";

const isValidDocType = (file) => ACCEPTED_DOC_TYPES.includes(file.type);

const getFileTypeLabel = (file) => {
  const type = file.type;
  if (type === "application/pdf") return "PDF";
  if (type === "application/msword" || type.includes("wordprocessingml")) return "DOC";
  if (type === "application/vnd.ms-powerpoint" || type.includes("presentationml")) return "PPT";
  return "Document";
};

const getDocIconColor = (file) => {
  if (!file) return "currentColor";
  const label = getFileTypeLabel(file);
  if (label === "PDF") return "#f87171";
  if (label === "DOC") return "#60a5fa";
  if (label === "PPT") return "#fb923c";
  return "#4ade80";
};

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const thumbInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    tags: "",
    category: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [document, setDocument] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Thumbnail must be an image file.");
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isValidDocType(file)) {
        setError("Document must be a PDF, DOC, DOCX, PPT, or PPTX file.");
        return;
      }
      setDocument(file);
      setError("");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (isValidDocType(file)) {
        setDocument(file);
        setError("");
      } else {
        setError("Please drop a PDF, DOC, DOCX, PPT, or PPTX file.");
      }
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!user) {
      setError("Please sign in to upload files.");
      return;
    }

    if (!form.title.trim() || !form.category || !thumbnail || !document) {
      setError("Title, category, thumbnail, and document are required.");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("tags", form.tags);
    data.append("category", form.category);
    data.append("thumbnail", thumbnail);
    data.append("document", document);

    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Upload failed. Please try again.");
        return;
      }

      setSuccess("File uploaded successfully!");

      setForm({ title: "", tags: "", category: "" });
      setThumbnail(null);
      setThumbnailPreview(null);
      setDocument(null);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-root">
      <div className="upload-card">
        <div className="upload-header">
          <div className="upload-icon">
            <img src={UploadIcon} alt="Upload" />
          </div>
          <h2>Upload Notes</h2>
          <p>Share your knowledge with the community</p>
        </div>

        <div className="upload-form">
          {/* Title */}
          <div className="field-group">
            <label className="field-label">Title</label>
            <div className="field-wrap">
              <input
                className="field-input"
                type="text"
                name="title"
                placeholder="Enter note title..."
                value={form.title}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category */}
          <div className="field-group">
            <label className="field-label">Category</label>
            <div className="field-wrap">
              <select
                className="field-input"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="field-group">
            <label className="field-label">Tags</label>
            <div className="field-wrap">
              <input
                className="field-input"
                type="text"
                name="tags"
                placeholder="e.g. math, algebra, grade10 (comma separated)"
                value={form.tags}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="field-group">
            <label className="field-label">Thumbnail</label>
            <div
              className={`drop-zone ${thumbnailPreview ? "has-preview" : ""}`}
              onClick={() => thumbInputRef.current?.click()}
            >
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="preview-img"
                />
              ) : (
                <div className="drop-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span>Click to upload thumbnail image</span>
                </div>
              )}
            </div>
            {thumbnail && <div className="file-name">{thumbnail.name}</div>}
          </div>

          {/* Document Upload */}
          <div className="field-group">
            <label className="field-label">
              Document{" "}
              <span style={{ fontWeight: 400, opacity: 0.6, fontSize: "0.85em" }}>
                (PDF, DOC, DOCX, PPT, PPTX)
              </span>
            </label>
            <div
              className={`drop-zone doc-zone ${dragActive ? "drag-active" : ""} ${
                document ? "has-doc" : ""
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => docInputRef.current?.click()}
            >
              <input
                ref={docInputRef}
                type="file"
                accept={ACCEPTED_DOC_EXTENSIONS}
                style={{ display: "none" }}
                onChange={handleDocumentChange}
              />
              {document ? (
                <div className="doc-preview">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={getDocIconColor(document)}
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span className="doc-name">{document.name}</span>
                  <span className="doc-meta">
                    {getFileTypeLabel(document)} &bull;{" "}
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="drop-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Drag & drop or click to browse</span>
                  <span style={{ fontSize: "0.78em", opacity: 0.5, marginTop: "4px" }}>
                    PDF · DOC · DOCX · PPT · PPTX
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>

          {!user && (
            <p className="auth-hint">
              Please <a href="/login">sign in</a> to upload files.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;