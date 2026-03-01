import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ScoreRing from "../components/ScoreRing";
import { useNavigate } from "react-router-dom";
import { getReports } from "../lib/supabase";

const REEFS = [
  {
    id: 1,
    name: "Moalboal Reef Wall",
    lat: 9.9367,
    lng: 123.3972,
    score: 78,
    status: "Healthy",
    bleach: 12,
    coverage: 74,
    location: "SW Cebu",
    lastReport: "2 hrs ago",
    threat: "Tourism pressure",
    depth: "5–25m",
  },
  {
    id: 2,
    name: "Pescador Island",
    lat: 9.8667,
    lng: 123.3667,
    score: 55,
    status: "At Risk",
    bleach: 38,
    coverage: 48,
    location: "SW Cebu",
    lastReport: "5 hrs ago",
    threat: "Thermal stress",
    depth: "3–40m",
  },
  {
    id: 3,
    name: "Malapascua Shoal",
    lat: 11.3333,
    lng: 124.1167,
    score: 31,
    status: "Critical",
    bleach: 71,
    coverage: 22,
    location: "N Cebu",
    lastReport: "1 day ago",
    threat: "Bleaching event",
    depth: "10–30m",
  },
  {
    id: 4,
    name: "Olango Island Flat",
    lat: 10.2667,
    lng: 124.0667,
    score: 82,
    status: "Healthy",
    bleach: 8,
    coverage: 80,
    location: "Mactan",
    lastReport: "1 day ago",
    threat: "Sedimentation",
    depth: "2–15m",
  },
  {
    id: 5,
    name: "Mactan North Reef",
    lat: 10.35,
    lng: 124.0,
    score: 47,
    status: "At Risk",
    bleach: 45,
    coverage: 40,
    location: "Mactan",
    lastReport: "2 days ago",
    threat: "Anchor damage",
    depth: "1–10m",
  },
  {
    id: 6,
    name: "Bantayan Island",
    lat: 11.1667,
    lng: 123.7167,
    score: 70,
    status: "Healthy",
    bleach: 20,
    coverage: 65,
    location: "N Cebu",
    lastReport: "3 days ago",
    threat: "Illegal fishing",
    depth: "3–20m",
  },
  {
    id: 7,
    name: "Camotes Sea Reef",
    lat: 10.6667,
    lng: 124.35,
    score: 40,
    status: "At Risk",
    bleach: 52,
    coverage: 38,
    location: "E Cebu",
    lastReport: "4 days ago",
    threat: "Crown-of-thorns",
    depth: "5–30m",
  },
];

const LOCATION_COORDS = {
  "Moalboal, Cebu": [9.9367, 123.3972],
  "Pescador Island": [9.8667, 123.3667],
  "Malapascua Island": [11.3333, 124.1167],
  "Mactan Island": [10.3157, 123.9494],
  "Camotes Island": [10.6667, 124.35],
  "Olango Island": [10.2667, 124.0667],
  "Bantayan Island": [11.1667, 123.7167],
  "Other / Unknown": [10.3157, 123.8854],
};

const statusColor = (s) =>
  ({ Healthy: "#4ade80", "At Risk": "#fb923c", Critical: "#f87171" })[s] ||
  "#94a3b8";

const statusBg = (s) =>
  ({
    Healthy: "rgba(74,222,128,0.08)",
    "At Risk": "rgba(251,146,60,0.08)",
    Critical: "rgba(248,113,113,0.08)",
  })[s];

const scoreColor = (n) =>
  n >= 65 ? "#4ade80" : n >= 40 ? "#fb923c" : "#f87171";

export default function ReefMap() {
  const [reefs, setReefs] = useState(REEFS);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadReports = async () => {
      const reports = await getReports(50);
      if (!active || !Array.isArray(reports) || reports.length === 0) return;

      const mapped = reports.map((r, idx) => {
        const location = r.location || "Other / Unknown";
        const [lat, lng] = LOCATION_COORDS[location] || LOCATION_COORDS["Other / Unknown"];
        const diff = (Date.now() - new Date(r.reported_at)) / 1000;
        const lastReport =
          !Number.isFinite(diff) || diff < 0
            ? "recently"
            : diff < 3600
              ? `${Math.max(1, Math.floor(diff / 60))} min ago`
              : diff < 86400
                ? `${Math.floor(diff / 3600)} hrs ago`
                : `${Math.floor(diff / 86400)} days ago`;

        return {
          id: r.id || `report-${idx}`,
          name: location,
          lat,
          lng,
          score: Number.isFinite(r.health_score) ? r.health_score : 0,
          status: r.status || "At Risk",
          bleach: Number.isFinite(r.bleaching_percent) ? r.bleaching_percent : 0,
          coverage: Number.isFinite(r.coral_coverage) ? r.coral_coverage : 0,
          location,
          lastReport,
          threat: r.main_threat || "Unknown",
          depth: "N/A",
        };
      });

      setReefs(mapped);
      setSelected((prev) =>
        prev ? mapped.find((m) => String(m.id) === String(prev.id)) || null : null,
      );
    };

    loadReports();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-12 py-5 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div>
          <p
            className="text-xs uppercase mb-1"
            style={{
              letterSpacing: "0.2em",
              color: "rgba(248,250,252,0.3)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Monitoring Network
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 28,
              fontWeight: 400,
              color: "#f8fafc",
              letterSpacing: "-0.01em",
            }}
          >
            Cebu Reef Map
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6">
          {["Healthy", "At Risk", "Critical"].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: statusColor(s) }}
              />
              <span
                className="text-xs"
                style={{
                  color: "rgba(248,250,252,0.4)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Map + Side Panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[10.3157, 123.8854]}
            zoom={8}
            style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="© CartoDB"
            />
            {reefs.map((reef) => (
              <CircleMarker
                key={reef.id}
                center={[reef.lat, reef.lng]}
                radius={selected?.id === reef.id ? 16 : 12}
                pathOptions={{
                  fillColor: statusColor(reef.status),
                  color:
                    selected?.id === reef.id
                      ? "#fff"
                      : statusColor(reef.status),
                  weight: selected?.id === reef.id ? 2 : 1,
                  opacity: 0.9,
                  fillOpacity: 0.35,
                }}
                eventHandlers={{
                  click: () =>
                    setSelected(selected?.id === reef.id ? null : reef),
                }}
              >
                <Tooltip
                  permanent={false}
                  direction="top"
                  className="reef-tooltip"
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                    }}
                  >
                    {reef.name} — {reef.score}/100
                  </span>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Side Panel */}
        <div
          className="flex-shrink-0 overflow-y-auto border-l"
          style={{
            width: 320,
            background: "#0a0a0a",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          {selected ? (
            <div className="p-6">
              {/* Close */}
              <div className="flex items-center justify-between mb-6">
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{
                    color: "rgba(248,250,252,0.3)",
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.15em",
                  }}
                >
                  {selected.location}
                </p>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(248,250,252,0.3)",
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Name + Score */}
              <div className="flex items-start justify-between mb-6">
                <h3
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 22,
                    fontWeight: 400,
                    color: "#f8fafc",
                    lineHeight: 1.2,
                    flex: 1,
                    paddingRight: 12,
                  }}
                >
                  {selected.name}
                </h3>
                <ScoreRing score={selected.score} size={60} />
              </div>

              {/* Status badge */}
              <div className="mb-6">
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{
                    background: statusBg(selected.status),
                    color: statusColor(selected.status),
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {selected.status}
                </span>
              </div>

              {/* Stats */}
              <div
                className="grid grid-cols-2 gap-px mb-6"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                {[
                  { label: "Bleaching", val: selected.bleach + "%" },
                  { label: "Coverage", val: selected.coverage + "%" },
                  { label: "Depth", val: selected.depth },
                  { label: "Last Report", val: selected.lastReport },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="p-4"
                    style={{ background: "#0a0a0a" }}
                  >
                    <div
                      className="text-xs uppercase mb-1"
                      style={{
                        letterSpacing: "0.1em",
                        color: "rgba(248,250,252,0.25)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{
                        color: "rgba(248,250,252,0.8)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Threat */}
              <div
                className="p-4 rounded-xl mb-6"
                style={{
                  background: "rgba(251,146,60,0.06)",
                  border: "1px solid rgba(251,146,60,0.15)",
                }}
              >
                <div
                  className="text-xs uppercase mb-1"
                  style={{
                    letterSpacing: "0.1em",
                    color: "rgba(248,250,252,0.3)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Primary Threat
                </div>
                <div
                  className="text-sm font-medium"
                  style={{
                    color: "#fb923c",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {selected.threat}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate("/analyze")}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{
                  background: "#f8fafc",
                  color: "#0a0a0a",
                  border: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                }}
              >
                Submit Photo Report →
              </button>
            </div>
          ) : (
            /* Reef list */
            <div>
              <div
                className="px-6 py-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <p
                  className="text-xs uppercase"
                  style={{
                    letterSpacing: "0.15em",
                    color: "rgba(248,250,252,0.3)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {reefs.length} Reefs Monitored
                </p>
              </div>
              {reefs.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-6 py-4 cursor-pointer border-b transition-colors hover:bg-white/2"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  onClick={() => setSelected(r)}
                >
                  <div>
                    <div
                      className="text-sm font-medium mb-1"
                      style={{
                        color: "#f8fafc",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {r.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: "rgba(248,250,252,0.3)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {r.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: statusColor(r.status) }}
                    />
                    <span
                      style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: 20,
                        color: scoreColor(r.score),
                      }}
                    >
                      {r.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
