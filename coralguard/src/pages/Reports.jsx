import { useState, useEffect } from "react";
import { getReports } from "../lib/supabase";
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
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

// Fallback static data if Supabase has no reports yet
const STATIC_REPORTS = [
  {
    id: 1,
    location: "Moalboal, Cebu",
    health_score: 78,
    status: "Healthy",
    bleaching_percent: 12,
    coral_coverage: 74,
    water_clarity: "Good",
    main_threat: "Tourism pressure",
    species: "Acropora sp.",
    urgency: "Low",
    reported_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 2,
    location: "Pescador Island",
    health_score: 55,
    status: "At Risk",
    bleaching_percent: 38,
    coral_coverage: 48,
    water_clarity: "Fair",
    main_threat: "Thermal stress",
    species: "Porites sp.",
    urgency: "Medium",
    reported_at: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 3,
    location: "Malapascua Island",
    health_score: 31,
    status: "Critical",
    bleaching_percent: 71,
    coral_coverage: 22,
    water_clarity: "Poor",
    main_threat: "Bleaching event",
    species: "Unknown",
    urgency: "Critical",
    reported_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 4,
    location: "Olango Island",
    health_score: 82,
    status: "Healthy",
    bleaching_percent: 8,
    coral_coverage: 80,
    water_clarity: "Excellent",
    main_threat: "Sedimentation",
    species: "Montipora sp.",
    urgency: "Low",
    reported_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 5,
    location: "Mactan Island",
    health_score: 47,
    status: "At Risk",
    bleaching_percent: 45,
    coral_coverage: 40,
    water_clarity: "Fair",
    main_threat: "Anchor damage",
    species: "Acropora sp.",
    urgency: "High",
    reported_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await getReports();
      setReports(data.length > 0 ? data : STATIC_REPORTS);
      setLoading(false);
    };
    load();
  }, []);

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
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
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
              </div>

              {/* Rows */}
              {reports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelected(selected?.id === r.id ? null : r)}
                  className="grid items-center py-4 cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
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
                </div>
              ))}
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
          </div>
        )}
      </div>
    </div>
  );
}
