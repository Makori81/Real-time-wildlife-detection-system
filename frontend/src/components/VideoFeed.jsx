/**
 * frontend/components/VideoFeed.jsx
 *
 * The live video panel (left side of the dashboard).
 *
 * ⭐ HOW THE VIDEO WORKS ⭐
 * The backend sends an MJPEG stream (a continuous flow of JPEG frames).
 * We connect to it simply by pointing an <img> src at the backend URL.
 * The backend already draws bounding boxes before sending each frame —
 * so this component just displays it, no detection logic here.
 *
 * Props:
 *   isRunning  {bool}    — whether camera is active
 *   onStart    {func}    — called when Start button clicked
 *   onStop     {func}    — called when Stop button clicked
 *   onUpload   {func}    — called with File when user uploads a video
 *   fps        {number}  — current FPS to display
 *   frameCount {number}  — current frame number to display
 */

import { useRef } from "react";

const BACKEND_URL = "http://localhost:5000"; // ⭐ Change if backend is on another machine

export default function VideoFeed({ isRunning, onStart, onStop, onUpload, fps, frameCount }) {
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) onUpload(file);
    e.target.value = ""; // reset so same file can be re-uploaded
  }

  return (
    <div className="panel">
      {/* Panel header */}
      <div className="panel-header">
        <span className="panel-title">Live Video Feed</span>
        <span className="frame-counter">
          FRAME {frameCount || "—"}
        </span>
      </div>

      {/* Video area */}
      <div className="video-wrapper">

        {/*
          ⭐ STREAM CONNECTION ⭐
          This img tag connects to GET /api/video/stream on the backend.
          When camera is running, the backend pushes annotated frames here.
          Bounding boxes (lion=green, hyena=purple, buffalo=red) are
          already drawn by the backend before each frame is sent.
        */}
        {isRunning && (
          <img
            src={`${BACKEND_URL}/api/video/stream`}
            alt="Live detection feed"
            className="video-feed-img"
          />
        )}

        {/* Shown when camera is off */}
        {!isRunning && (
          <div className="video-overlay">
            <span className="overlay-icon">📷</span>
            <span className="overlay-text">Camera inactive — press Start</span>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="video-controls">

        {/* Start button → calls POST /api/camera/start (via onStart prop) */}
        <button
          className="btn btn-primary"
          onClick={onStart}
          disabled={isRunning}
        >
          ▶ Start
        </button>

        {/* Stop button → calls POST /api/camera/stop (via onStop prop) */}
        <button
          className="btn btn-danger"
          onClick={onStop}
          disabled={!isRunning}
        >
          ■ Stop
        </button>

        {/* Upload button → POST /api/video/upload (via onUpload prop) */}
        <button
          className="btn btn-secondary"
          onClick={() => fileInputRef.current.click()}
        >
          ⬆ Upload Video
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* FPS display — value comes from polling /api/detections/live */}
        <span className="fps-badge">
          FPS: <strong>{fps || "—"}</strong>
        </span>
      </div>
    </div>
  );
}
