import { useState, useEffect } from "react";
import { getReports, deleteReport, clearReports } from "../lib/supabase";
import ScoreRing from "../components/ScoreRing";
import { useNavigate } from "react-router-dom";

const scoreColor = (n) =>
  n >= 65 ? "#4ade80" : n >= 40 ? "#fb923c" : "#f87171";

const statusColor = (s) =>
  ({ Healthy: "#4ade80", "At Risk": "#fb923c", Critical: "#f87171" })[s] ||
  "#94a3b8";

const statusBg = (s) =>
  ({
    Healthy: "rgba(74,222,128,0.08)",
    "At Risk": "rgba(251,146,60,0.08)",
    Critical: "rgba(248,113,113,0.08)",
  })[s];

const urgencyColor = (u) =>
  ({ Low: "#4ade80", Medium: "#fb923c", High: "#f87171", Critical: "#f87171" })[
    u
  ] || "#94a3b8";

function timeAgo(dateStr) {
  if (!dateStr) return "unknown";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (Number.isNaN(diff) || diff < 0) return "unknown";
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  const reloadReports = async () => {
    const data = await getReports();
    setReports(data);
  };

  useEffect(() => {
    let active = true;
    const initLoad = async () => {
      const data = await getReports();
      if (!active) return;
      setReports(data);
      setLoading(false);
    };
    initLoad();
    return () => {
      active = false;
    };
  }, []);

  const onDelete = async (report) => {
    if (!report || busy) return;
    const confirmed = window.confirm(
      "Delete this report? This action cannot be undone.",
    );
    if (!confirmed) return;

    setActionError("");
    setBusy(true);
    const res = await deleteReport(report);
    setBusy(false);

    if (!res.success) {
      setActionError("Failed to delete report. Please try again.");
      return;
    }

    if (selected?.id === report.id) setSelected(null);
    await reloadReports();
  };

  const onClearAll = async () => {
    if (busy || reports.length === 0) return;
    const confirmed = window.confirm(
      "Clear all reports? This will remove all report records.",
    );
    if (!confirmed) return;

    setActionError("");
    setBusy(true);
    const res = await clearReports();
    setBusy(false);

    if (!res.success) {
      setActionError("Failed to clear reports. Please try again.");
      return;
    }

    setSelected(null);
    setReports([]);
  };

  const avgScore = reports.length
    ? Math.round(
        reports.reduce((a, r) => a + r.health_score, 0) / reports.length,
      )
    : 0;
  const healthy = reports.filter((r) => r.status === "Healthy").length;
  const atRisk = reports.filter((r) => r.status === "At Risk").length;
  const critical = reports.filter((r) => r.status === "Critical").length;

  return (
    <div className="pb-20">
      {/* ── Header ── */}
      <div
        className="px-12 pt-12 pb-8 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-xs uppercase mb-3"
              style={{
                letterSpacing: "0.2em",
                color: "rgba(248,250,252,0.3)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Data
            </p>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 36,
                fontWeight: 400,
                color: "#f8fafc",
                letterSpacing: "-0.01em",
              }}
            >
              Reef Reports
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClearAll}
              disabled={busy || reports.length === 0}
              className="text-sm font-semibold px-5 py-2.5 rounded-full transition-opacity hover:opacity-80"
              style={{
                background:
                  busy || reports.length === 0
                    ? "rgba(248,113,113,0.3)"
                    : "rgba(248,113,113,0.18)",
                color: "#f87171",
                border: "1px solid rgba(248,113,113,0.35)",
                fontFamily: "'DM Sans', sans-serif",
                cursor:
                  busy || reports.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              {busy ? "Working…" : "Clear All"}
            </button>
            <button
              onClick={() => navigate("/analyze")}
              className="text-sm font-semibold px-6 py-2.5 rounded-full transition-opacity hover:opacity-80"
              style={{
                background: "#f8fafc",
                color: "#0a0a0a",
                border: "none",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              + New Report
            </button>
          </div>
        </div>
        {actionError && (
          <p
            className="mt-3 text-xs"
            style={{ color: "#f87171", fontFamily: "'DM Sans', sans-serif" }}
          >
            {actionError}
          </p>
        )}
      </div>

      {/* ── Metrics ── */}
      <div
        className="grid border-b"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {[
          { label: "Total Reports", val: reports.length, color: "#f8fafc" },
          {
            label: "Avg Health Score",
            val: avgScore + "/100",
            color: scoreColor(avgScore),
          },
          {
            label: "At Risk + Critical",
            val: atRisk + critical,
            color: "#fb923c",
          },
          { label: "Healthy", val: healthy, color: "#4ade80" },
        ].map((m, i) => (
          <div
            key={i}
            className="px-10 py-8"
            style={{
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <div
              className="text-xs uppercase mb-3"
              style={{
                letterSpacing: "0.15em",
                color: "rgba(248,250,252,0.3)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 40,
                fontWeight: 400,
                lineHeight: 1,
                color: m.color,
              }}
            >
              {m.val}
            </div>
          </div>
        ))}
      </div>

      {/* ── Table + Detail Panel ── */}
      <div className="flex">
        {/* Table */}
        <div className="flex-1 px-12 pt-8">
          <p
            className="text-xs uppercase mb-5"
            style={{
              letterSpacing: "0.15em",
              color: "rgba(248,250,252,0.3)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            All Reports
          </p>

          {loading ? (
            <div className="flex items-center gap-3 py-12">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: "rgba(74,222,128,0.2)",
                  borderTopColor: "#4ade80",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span
                className="text-sm"
                style={{
                  color: "rgba(248,250,252,0.3)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Loading reports…
              </span>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div
                className="grid text-xs uppercase pb-3 mb-1"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                  letterSpacing: "0.12em",
                  color: "rgba(248,250,252,0.25)",
                  fontFamily: "'DM Sans', sans-serif",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>Location</div>
                <div>Score</div>
                <div>Status</div>
                <div>Bleaching</div>
                <div>Reported</div>
                <div>Action</div>
              </div>

              {/* Rows */}
              {reports.length === 0 ? (
                <div
                  className="py-12 text-center"
                  style={{
                    color: "rgba(248,250,252,0.45)",
                    fontFamily: "'DM Sans', sans-serif",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  No reports yet. Analyze a reef photo to create your first report.
                </div>
              ) : (
                reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelected(selected?.id === r.id ? null : r)}
                    className="grid items-center py-4 cursor-pointer transition-colors"
                    style={{
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background:
                        selected?.id === r.id
                          ? "rgba(255,255,255,0.02)"
                          : "transparent",
                      borderLeft:
                        selected?.id === r.id
                          ? `2px solid ${statusColor(r.status)}`
                          : "2px solid transparent",
                      paddingLeft: 8,
                    }}
                  >
                    <div
                      className="text-sm font-medium"
                      style={{
                        color: "#f8fafc",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {r.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontFamily: "'Instrument Serif', serif",
                          fontSize: 20,
                          color: scoreColor(r.health_score),
                        }}
                      >
                        {r.health_score}
                      </span>
                    </div>
                    <div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: statusBg(r.status),
                          color: statusColor(r.status),
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: "rgba(248,250,252,0.5)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {r.bleaching_percent}%
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: "rgba(248,250,252,0.3)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {timeAgo(r.reported_at)}
                    </div>
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(r);
                        }}
                        disabled={busy}
                        className="text-xs px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
                        style={{
                          background: "rgba(248,113,113,0.1)",
                          border: "1px solid rgba(248,113,113,0.3)",
                          color: "#f87171",
                          fontFamily: "'DM Sans', sans-serif",
                          cursor: busy ? "not-allowed" : "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div
            className="flex-shrink-0 border-l p-8"
            style={{
              width: 300,
              borderColor: "rgba(255,255,255,0.06)",
              borderTop: "none",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <p
                className="text-xs uppercase"
                style={{
                  letterSpacing: "0.15em",
                  color: "rgba(248,250,252,0.3)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Detail
              </p>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(248,250,252,0.3)",
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Score Ring */}
            <div className="flex justify-center mb-6">
              <ScoreRing score={selected.health_score} size={90} />
            </div>

            {/* Location */}
            <div
              className="text-center mb-6"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 20,
                color: "#f8fafc",
              }}
            >
              {selected.location}
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-3">
              {[
                ["Status", selected.status, statusColor(selected.status)],
                ["Bleaching", selected.bleaching_percent + "%", "#f8fafc"],
                ["Coverage", selected.coral_coverage + "%", "#f8fafc"],
                ["Clarity", selected.water_clarity, "#f8fafc"],
                ["Urgency", selected.urgency, urgencyColor(selected.urgency)],
                ["Threat", selected.main_threat, "#fb923c"],
                ["Species", selected.species, "#f8fafc"],
              ].map(([k, v, c]) => (
                <div
                  key={k}
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <span
                    className="text-xs"
                    style={{
                      color: "rgba(248,250,252,0.3)",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {k}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: c, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            {selected.recommendation && (
              <div
                className="mt-5 p-4 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="text-xs uppercase mb-2"
                  style={{
                    letterSpacing: "0.1em",
                    color: "rgba(248,250,252,0.25)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  AI Recommendation
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    color: "rgba(248,250,252,0.5)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {selected.recommendation}
                </p>
              </div>
            )}

            {/* Reported at */}
            <div
              className="mt-4 text-xs text-center"
              style={{
                color: "rgba(248,250,252,0.2)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {timeAgo(selected.reported_at)}
            </div>
            <button
              onClick={() => onDelete(selected)}
              disabled={busy}
              className="w-full mt-4 py-2.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "#f87171",
                fontFamily: "'DM Sans', sans-serif",
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              Delete This Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
