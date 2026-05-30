import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import "./PreviewFile.css"

const PreviewFile = () => {
  const { fileId } = useParams()
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchPreview()
  }, [fileId])

  const fetchPreview = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/files/preview/${fileId}`)
      if (!response.ok) {
        throw new Error('Failed to load preview')
      }
      const data = await response.json()
      setPreview(data)
    } catch (err) {
      console.error("Preview fetch error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (preview) {
      try {
        const headers = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        const response = await fetch(`${API_URL}/api/files/download/${fileId}`, {
          headers
        })
        
        if (!response.ok) {
          throw new Error('Download failed')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = preview.title || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Download error:", err)
        alert('Failed to download file')
      }
    }
  }

  if (loading) {
    return (
      <div className="preview-container loading">
        <div className="spinner">
          <div className="spinner-circle"></div>
          <p>Loading preview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="preview-container error">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    )
  }

  if (!preview) {
    return (
      <div className="preview-container error">
        <div className="error-message">
          <p>⚠️ Preview not available</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    )
  }

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'difficulty-beginner'
      case 'intermediate':
        return 'difficulty-intermediate'
      case 'advanced':
        return 'difficulty-advanced'
      default:
        return 'difficulty-unknown'
    }
  }

  const formatSafe = preview?.format ? String(preview.format) : 'unknown'
  const summarySafe = preview?.summary || {
    overview: 'Preview not available for this file.',
    mainTopics: [],
    keyPoints: [],
    difficultyLevel: 'Unknown',
  }

  return (
    <div className="preview-container">
      {/* Header */}
      <div className="preview-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="file-info">
            <h1>{preview.title}</h1>
            <span className="format-badge">{formatSafe.toUpperCase()}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="download-btn" onClick={handleDownload}>
            ⬇️ Download Full File
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="preview-content">
        {/* Left Column - Summary Content */}
        <div className="content-main">
          {/* Overview Card */}
          <div className="overview-card">
            <h2>Overview</h2>
            <p>{summarySafe.overview || 'No overview available'}</p>
          </div>

          {/* Main Topics */}
          {summarySafe.mainTopics && summarySafe.mainTopics.length > 0 && (
            <div className="topics-section">
              <h2>Main Topics</h2>
              <div className="topics-container">
                {summarySafe.mainTopics.map((topic, idx) => (
                  <span key={idx} className="topic-chip">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Points */}
          {summarySafe.keyPoints && summarySafe.keyPoints.length > 0 && (
            <div className="keypoints-section">
              <h2>Key Points</h2>
              <ul className="keypoints-list">
                {summarySafe.keyPoints.map((point, idx) => (
                  <li key={idx}>
                    <span className="checkmark">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Difficulty Level */}
          {summarySafe.difficultyLevel && (
            <div className="difficulty-section">
              <span className="difficulty-label">Difficulty Level</span>
              <span className={`difficulty-badge ${getDifficultyColor(summarySafe.difficultyLevel)}`}>
                {summarySafe.difficultyLevel}
              </span>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="content-sidebar">
          {/* File Details */}
          <div className="sidebar-card">
            <h3>📄 File Details</h3>
            <div className="detail-item">
              <span className="label">Format</span>
              <span className="value">{formatSafe.toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Uploaded by</span>
              <span className="value">{preview.uploadedBy || 'Unknown'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Downloads</span>
              <span className="value">{preview.downloadCount || 0}</span>
            </div>
          </div>

          {/* AI Summary Info */}
          <div className="sidebar-card ai-info">
            <div className="ai-header">
              <span className="ai-icon">✨</span>
              <span className="ai-label">AI Generated Summary</span>
            </div>
            <p className="ai-badge">
              {preview.isCached ? '⚡ Instant Preview' : '🔄 Freshly Generated'}
            </p>
          </div>

          {/* Download Button */}
          <button className="download-full-btn" onClick={handleDownload}>
            📥 Download Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default PreviewFile