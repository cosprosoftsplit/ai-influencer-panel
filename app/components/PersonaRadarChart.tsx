"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface PersonaMetrics {
  introversion: number;
  emotional_depth: number;
  visual_aesthetic: number;
  content_pace: number;
  tech_attitude: number;
  authenticity: number;
  engagement_style: number;
  nostalgia_factor: number;
}

interface PersonaData {
  persona_id: string;
  name: string;
  color: string;
  metrics: PersonaMetrics;
}

interface Props {
  personas: PersonaData[];
  showComparison?: boolean;
}

const METRIC_LABELS: Record<keyof PersonaMetrics, string> = {
  introversion: "Introversion",
  emotional_depth: "Emotional Depth",
  visual_aesthetic: "Visual Style",
  content_pace: "Content Pace",
  tech_attitude: "Tech Embrace",
  authenticity: "Authenticity",
  engagement_style: "Engagement",
  nostalgia_factor: "Nostalgia",
};

const METRIC_DESCRIPTIONS: Record<keyof PersonaMetrics, [string, string]> = {
  introversion: ["Extroverted", "Introverted"],
  emotional_depth: ["Light/Playful", "Deep/Melancholic"],
  visual_aesthetic: ["Minimalist", "Maximalist"],
  content_pace: ["Slow/Contemplative", "Fast/Chaotic"],
  tech_attitude: ["Tech Skeptic", "Tech Native"],
  authenticity: ["Polished/Curated", "Raw/Vulnerable"],
  engagement_style: ["Observer", "Provocateur"],
  nostalgia_factor: ["Future-Focused", "Past-Focused"],
};

export default function PersonaRadarChart({ personas, showComparison = false }: Props) {
  // Transform data for Recharts
  const chartData = Object.keys(METRIC_LABELS).map((key) => {
    const metricKey = key as keyof PersonaMetrics;
    const dataPoint: Record<string, string | number> = {
      metric: METRIC_LABELS[metricKey],
      fullMark: 10,
    };

    personas.forEach((persona) => {
      dataPoint[persona.persona_id] = persona.metrics[metricKey];
    });

    return dataPoint;
  });

  const COLORS = [
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
  ];

  if (personas.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No persona data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {showComparison ? "Persona Comparison" : `${personas[0].name} Profile`}
        </h3>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickCount={6}
              axisLine={false}
            />

            {personas.map((persona, index) => (
              <Radar
                key={persona.persona_id}
                name={persona.name}
                dataKey={persona.persona_id}
                stroke={persona.color || COLORS[index % COLORS.length]}
                fill={persona.color || COLORS[index % COLORS.length]}
                fillOpacity={showComparison ? 0.2 : 0.3}
                strokeWidth={2}
              />
            ))}

            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => <span className="text-gray-700">{value}</span>}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number, name: string) => [
                `${value}/10`,
                personas.find((p) => p.persona_id === name)?.name || name,
              ]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Metric Legend */}
      {!showComparison && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(METRIC_LABELS).map(([key, label]) => {
            const metricKey = key as keyof PersonaMetrics;
            const value = personas[0]?.metrics[metricKey] || 0;
            const [low, high] = METRIC_DESCRIPTIONS[metricKey];

            return (
              <div key={key} className="text-center">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-2xl font-bold text-purple-600">{value}</p>
                <p className="text-xs text-gray-500">
                  {value <= 3 ? low : value >= 7 ? high : "Balanced"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper component for single persona display
export function SinglePersonaChart({ persona }: { persona: PersonaData }) {
  return <PersonaRadarChart personas={[persona]} showComparison={false} />;
}

// Helper component for comparison view
export function ComparePersonasChart({ personas }: { personas: PersonaData[] }) {
  return <PersonaRadarChart personas={personas} showComparison={true} />;
}