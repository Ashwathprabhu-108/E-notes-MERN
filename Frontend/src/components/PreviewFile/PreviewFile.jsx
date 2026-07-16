import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import "./PreviewFile.css"
import { useAuth } from '../../context/AuthContext'

const PreviewFile = () => {
  const { fileId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [reportMessage, setReportMessage] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportStatus, setReportStatus] = useState(null) // null | 'pending' | 'reviewed' | 'dismissed'
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchPreview()
  }, [fileId])

  useEffect(() => {
    if (token && fileId) fetchReportStatus()
  }, [token, fileId])

  const fetchReportStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reports/my-report/${fileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.reported) setReportStatus(data.status)
      else setReportStatus(null)
    } catch {
      // silently ignore
    }
  }

  const fetchPreview = async () => {
    try {
      setLoading(true)
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`${API_URL}/api/files/preview/${fileId}`, { headers })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to load preview')
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
    if (user?.isDisabled) {
      alert("Your account has been disabled. Contact support.");
      return;
    }
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

  const handleReportClick = () => {
    if (user?.isDisabled) {
      alert("Your account has been disabled. Contact support.");
      return;
    }
    if (!token) {
      setReportMessage({ type: 'login', text: 'Please login to report this file' })
      setTimeout(() => setReportMessage(null), 3000)
      return
    }
    setShowReportModal(true)
  }

  const handleSubmitReport = async () => {
    if (!reportReason) {
      setReportMessage({ type: 'error', text: 'Please select a reason' })
      return
    }

    setReportLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileId,
          reason: reportReason,
          description: reportDescription || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.message?.includes('already reported')) {
          setShowReportModal(false)
          setReportMessage({ type: 'warning', text: 'You have already reported this file.' })
          setTimeout(() => setReportMessage(null), 3000)
        } else {
          setReportMessage({ type: 'error', text: data.message || 'Failed to submit report. Try again.' })
        }
      } else {
        setShowReportModal(false)
        setReportReason("")
        setReportDescription("")
        setReportStatus('pending')
        setReportMessage({ type: 'success', text: 'Report submitted successfully. Our team will review it.' })
        setTimeout(() => setReportMessage(null), 4000)
      }
    } catch (err) {
      console.error("Report submission error:", err)
      setReportMessage({ type: 'error', text: 'Failed to submit report. Try again.' })
    } finally {
      setReportLoading(false)
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
          <p> {error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    )
  }

  if (!preview) {
    return (
      <div className="preview-container error">
        <div className="error-message">
          <p>Preview not available</p>
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

      {/* Report Message */}
      {reportMessage && (
        <div className={`report-message report-message-${reportMessage.type}`}>
          {reportMessage.text}
        </div>
      )}

      {/* Main Content */}
      <div className="preview-content">
        <div className="content-main">

          {/* Header Card */}
          <div className="preview-header-card">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
              <div className="file-info">
                <h1>{preview.title}</h1>
                <span className="format-badge">{formatSafe.toUpperCase()}</span>
              </div>
            </div>
            <div className="header-right">
              <div className="report-btn-wrapper">
                <button className="report-btn" onClick={handleReportClick}>🚩 Report</button>
                {reportStatus && (
                  <div className={`report-status-tooltip report-status-${reportStatus}`}>
                    {reportStatus === 'pending' ? 'Pending' : 'Resolved'}
                  </div>
                )}
              </div>
              <button className="download-btn" onClick={handleDownload}>⬇ Download Full File</button>
            </div>
          </div>

          {/* File Details */}
          <div className="file-details-card">
            <h2>File Details</h2>
            <div className="file-details-row">
              <div className="file-detail-item">
                <span className="detail-label">Format</span>
                <span className="detail-value">{formatSafe.toUpperCase()}</span>
              </div>
              <div className="file-detail-item">
                <span className="detail-label">Uploaded by</span>
                <span className="detail-value">{preview.uploadedBy || 'Unknown'}</span>
              </div>
              <div className="file-detail-item">
                <span className="detail-label">Downloads</span>
                <span className="detail-value">{preview.downloadCount || 0}</span>
              </div>
              {summarySafe.difficultyLevel && (
                <div className="file-detail-item">
                  <span className="detail-label">Difficulty</span>
                  <span className={`difficulty-badge ${getDifficultyColor(summarySafe.difficultyLevel)}`}>
                    {summarySafe.difficultyLevel}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Overview */}
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

        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="report-modal-overlay" onClick={() => !reportLoading && setShowReportModal(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Report File</h2>
            <p className="subtitle">{preview.title}</p>

            <div className="report-reasons">
              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reason"
                  value="Inappropriate content"
                  checked={reportReason === "Inappropriate content"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <span>Inappropriate content</span>
              </label>
              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reason"
                  value="Copyright violation"
                  checked={reportReason === "Copyright violation"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <span>Copyright violation</span>
              </label>
              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reason"
                  value="Wrong category"
                  checked={reportReason === "Wrong category"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <span>Wrong category</span>
              </label>
              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reason"
                  value="Spam"
                  checked={reportReason === "Spam"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <span>Spam</span>
              </label>
              <label className="report-reason-option">
                <input
                  type="radio"
                  name="reason"
                  value="Other"
                  checked={reportReason === "Other"}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <span>Other</span>
              </label>
            </div>

            {reportReason === "Other" && (
              <div className="report-description">
                <textarea
                  placeholder="Please describe the issue..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows="4"
                />
              </div>
            )}

            {reportMessage && reportMessage.type === 'error' && (
              <div className="report-modal-error">{reportMessage.text}</div>
            )}

            <div className="report-modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowReportModal(false)}
                disabled={reportLoading}
              >
                Cancel
              </button>
              <button
                className="submit-report-btn"
                onClick={handleSubmitReport}
                disabled={!reportReason || reportLoading}
              >
                {reportLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PreviewFile