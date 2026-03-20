// ScoreRing renders a circular gauge showing a reef health score out of 100.
export default function ScoreRing({ score, size = 80 }) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  const color = score >= 65 ? "#4ade80" : score >= 40 ? "#fb923c" : "#f87171";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={4}
      />
      {/* Score ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        style={{
          transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      {/* Score number in center */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={size * 0.22}
        fontWeight="600"
        fontFamily="'Instrument Serif', serif"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: `${size / 2}px ${size / 2}px`,
        }}
      >
        {score}
      </text>
    </svg>
  );
}
