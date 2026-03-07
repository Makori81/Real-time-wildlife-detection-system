/**
 * frontend/components/DetectionOverlay.jsx
 *
 * The Detection History table at the bottom of the dashboard.
 *
 * Shows all logged detections with species, confidence, time, date,
 * alert status, and a delete action per row.
 *
 * ⭐ DATA FLOW ⭐
 * Data is passed in as props from History.jsx (or Dashboard.jsx).
 * History.jsx fetches data by calling:
 *   GET  /api/detections/logs?limit=100&species=<filter>
 *   DELETE /api/detections/<id>  (when Delete is clicked)
 *
 * Props:
 *   logs       {Array}   — detection records from the database
 *   onDelete   {func}    — called with detection id when Delete clicked
 *   onFilter   {func}    — called with species string when filter changes
 *   totalCount {number}  — total entries shown in toolbar
 */

const SPECIES_COLORS = {
  lions:    "#22c55e",
  hyenas:   "#a855f7",
  Buffalo: "#ef4444",
};

export default function DetectionOverlay({ logs = [], onDelete, onFilter, totalCount = 0 }) {
  return (
    <div className="logs-panel" id="logs">

      {/* Toolbar: title + filter dropdown + count */}
      <div className="logs-toolbar">
        <span className="panel-title">Detection History</span>

        {/*
          Species filter — onFilter sends value to History.jsx
          which re-calls GET /api/detections/logs?species=<value>
        */}
        <select
          className="filter-select"
          onChange={(e) => onFilter(e.target.value)}
          defaultValue=""
        >
          <option value="">All Species</option>
          <option value="lions">Lion</option>
          <option value="hyenas">Hyena</option>
          <option value="Buffalo">Buffalo</option>
        </select>

        <span className="log-count">{totalCount} entries</span>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Species</th>
              <th>Confidence</th>
              <th>Time</th>
              <th>Date</th>
              <th>Alert</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  No detections recorded yet
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const color = SPECIES_COLORS[log.species] || "#64748b";
                const confPct = Math.round(log.confidence * 100);
                return (
                  <tr key={log.id}>
                    {/* Species with color dot */}
                    <td>
                      <div className="species-tag">
                        <div className="dot" style={{ background: color }} />
                        {log.species}
                      </div>
                    </td>

                    {/* Confidence bar + percentage */}
                    <td>
                      <div className="conf-bar-wrap">
                        <div className="conf-bar">
                          <div
                            className="conf-bar-fill"
                            style={{ width: `${confPct}%` }}
                          />
                        </div>
                        <span className="conf-text">{confPct}%</span>
                      </div>
                    </td>

                    <td><span className="time-text">{log.timestamp}</span></td>
                    <td><span className="time-text">{log.date}</span></td>

                    {/* Alert badge */}
                    <td>
                      <span className={`alert-badge ${log.alert_sent ? "sent" : "no"}`}>
                        {log.alert_sent ? "✓ Sent" : "—"}
                      </span>
                    </td>

                    {/* Delete — calls DELETE /api/detections/<id> via onDelete prop */}
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => {
                          if (window.confirm("Delete this record?")) {
                            onDelete(log.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
