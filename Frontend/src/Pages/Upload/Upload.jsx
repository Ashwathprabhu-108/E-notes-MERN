import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Upload.css";
import UploadIcon from "../../assets/Upload.svg";
import API_BASE_URL from "../../config/api";

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
      const res = await fetch(`${API_BASE_URL}/api/files/upload`, {
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

  if (user?.isDisabled) {
    return (
      <div className="upload-root">
        <div className="upload-card">
          <div className="upload-header">
            <h2>Upload Notes</h2>
          </div>
          <div className="uploads-message error" style={{ padding: '2rem', textAlign: 'center', color: '#f87171', fontSize: '1rem' }}>
            ⚠️ Your account has been disabled. Contact support.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-root">
      <div className="upload-card">
        <div className="upload-header">
          <h2>Upload Notes</h2>
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
              className={`drop-zone doc-zone ${dragActive ? "drag-active" : ""} ${document ? "has-doc" : ""
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
                  <span className="doc-name">{document.name}</span>
                  <span className="doc-meta">
                    {getFileTypeLabel(document)} &bull;{" "}
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="drop-placeholder">
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