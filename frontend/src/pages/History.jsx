/**
 * frontend/pages/History.jsx
 *
 * THE HISTORY PAGE — shows the full detection log table.
 * Can also be embedded at the bottom of Dashboard.jsx.
 *
 * ⭐ API CALLS MADE HERE ⭐
 *   GET    /api/detections/logs?limit=100&species=<filter>
 *   DELETE /api/detections/<id>
 *   GET    /api/detections/stats   (for count in toolbar)
 */

import { useState, useEffect } from "react";
import DetectionOverlay from "../components/DetectionOverlay";

// ⭐ BACKEND URL — keep in sync with Dashboard.jsx
const BACKEND_URL = "http://localhost:5000";

export default function History() {
  const [logs, setLogs]           = useState([]);
  const [totalCount, setTotal]    = useState(0);
  const [speciesFilter, setFilter] = useState("");

  // Load logs on mount and whenever filter changes
  useEffect(() => {
    loadLogs(speciesFilter);
  }, [speciesFilter]);

  // Auto-refresh logs every 10s
  useEffect(() => {
    const interval = setInterval(() => loadLogs(speciesFilter), 10000);
    return () => clearInterval(interval);
  }, [speciesFilter]);


  // ── FETCH LOGS ─────────────────────────────────────────────────────────────
  // Calls GET /api/detections/logs
  async function loadLogs(species = "") {
    const url = species
      ? `${BACKEND_URL}/api/detections/logs?limit=100&species=${species}`
      : `${BACKEND_URL}/api/detections/logs?limit=100`;

    try {
      const res  = await fetch(url);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch {
      // Backend may be offline
    }
  }


  // ── DELETE A LOG ENTRY ─────────────────────────────────────────────────────
  // Calls DELETE /api/detections/<id>
  async function handleDelete(id) {
    try {
      await fetch(`${BACKEND_URL}/api/detections/${id}`, { method: "DELETE" });
      loadLogs(speciesFilter); // Refresh table after delete
    } catch {
      alert("Could not delete — is backend running?");
    }
  }


  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <DetectionOverlay
      logs={logs}
      totalCount={totalCount}
      onDelete={handleDelete}
      onFilter={(val) => setFilter(val)}
    />
  );
}
