"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ContentSlot {
  slot_id: string;
  persona_id: string;
  scheduled_date: string;
  scheduled_time: string;
  platform: string;
  content_type: string;
  title: string;
  description: string;
  asset_ids: string;
  status: string;
  publish_url: string;
  notes: string;
}

interface Persona {
  persona_id: string;
  name: string;
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "twitter", label: "X / Twitter", icon: "🐦" },
  { id: "threads", label: "Threads", icon: "🧵" },
];

const CONTENT_TYPES = [
  { id: "reel", label: "Reel" },
  { id: "short", label: "Short" },
  { id: "post", label: "Post" },
  { id: "story", label: "Story" },
  { id: "video", label: "Video" },
  { id: "carousel", label: "Carousel" },
];

const STATUS_OPTIONS = [
  { id: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { id: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  { id: "ready", label: "Ready", color: "bg-yellow-100 text-yellow-800" },
  { id: "published", label: "Published", color: "bg-green-100 text-green-800" },
  { id: "failed", label: "Failed", color: "bg-red-100 text-red-800" },
];

const PERSONA_COLORS: Record<string, string> = {
  alma: "border-l-purple-500 bg-purple-50",
  maja: "border-l-pink-500 bg-pink-50",
  dino: "border-l-blue-500 bg-blue-50",
  default: "border-l-gray-500 bg-gray-50",
};

export default function CalendarPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<ContentSlot[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSlot, setShowNewSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ContentSlot | null>(null);

  // Filters
  const [filterPersona, setFilterPersona] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Current week view
  const [currentDate, setCurrentDate] = useState(new Date());

  // New slot form
  const [newSlot, setNewSlot] = useState({
    persona_id: "",
    scheduled_date: "",
    scheduled_time: "",
    platform: "",
    content_type: "",
    title: "",
    description: "",
    status: "draft",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [calendarRes, personasRes] = await Promise.all([
        fetch("/api/calendar"),
        fetch("/api/personas"),
      ]);
      const calendarData = await calendarRes.json();
      const personasData = await personasRes.json();

      setSlots(Array.isArray(calendarData) ? calendarData : []);
      setPersonas(Array.isArray(personasData) ? personasData : []);
    } catch (err) {
      console.error(err);
      setSlots([]);
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  const createSlot = async () => {
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });

      if (res.ok) {
        setShowNewSlot(false);
        setNewSlot({
          persona_id: "",
          scheduled_date: "",
          scheduled_time: "",
          platform: "",
          content_type: "",
          title: "",
          description: "",
          status: "draft",
          notes: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get week days
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getSlotsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return slots.filter((slot) => {
      if (slot.scheduled_date !== dateStr) return false;
      if (filterPersona !== "all" && slot.persona_id !== filterPersona) return false;
      if (filterPlatform !== "all" && slot.platform !== filterPlatform) return false;
      if (filterStatus !== "all" && slot.status !== filterStatus) return false;
      return true;
    });
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const getPersonaColor = (personaId: string) => {
    return PERSONA_COLORS[personaId] || PERSONA_COLORS.default;
  };

  const getStatusStyle = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.id === status)?.color || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading calendar...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700 mb-4"
          >
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
              <p className="text-gray-600">Plan and schedule content across all personas</p>
            </div>
            <button
              onClick={() => setShowNewSlot(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + New Content
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-4">
            <select
              value={filterPersona}
              onChange={(e) => setFilterPersona(e.target.value)}
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white"
            >
              <option value="all">All Personas</option>
              {personas.map((p) => (
                <option key={p.persona_id} value={p.persona_id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white"
            >
              <option value="all">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => navigateWeek(-1)}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-900 bg-white"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-900 bg-white" 
              >
                Today
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-900 bg-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Week Header */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day) => {
              const isToday = formatDate(day) === formatDate(new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`p-4 text-center border-r last:border-r-0 ${
                    isToday ? "bg-purple-50" : ""
                  }`}
                >
                  <p className="text-sm text-gray-500">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isToday ? "text-purple-600" : "text-gray-900"
                    }`}
                  >
                    {day.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Week Content */}
          <div className="grid grid-cols-7 min-h-96">
            {weekDays.map((day) => {
              const daySlots = getSlotsForDate(day);
              const isToday = formatDate(day) === formatDate(new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`border-r last:border-r-0 p-2 ${
                    isToday ? "bg-purple-50/30" : ""
                  }`}
                >
                  {daySlots.map((slot) => (
                    <div
                      key={slot.slot_id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 mb-2 rounded border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getPersonaColor(
                        slot.persona_id
                      )}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs">
                          {PLATFORMS.find((p) => p.id === slot.platform)?.icon}
                        </span>
                        <span className="text-xs text-gray-500">
                          {slot.scheduled_time || "No time"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {slot.title || "Untitled"}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {personas.find((p) => p.persona_id === slot.persona_id)?.name || slot.persona_id}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusStyle(slot.status)}`}>
                          {slot.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {weekDays.reduce((acc, day) => acc + getSlotsForDate(day).length, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Drafts</p>
            <p className="text-2xl font-bold text-gray-900">
              {slots.filter((s) => s.status === "draft").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Scheduled</p>
            <p className="text-2xl font-bold text-gray-900">
              {slots.filter((s) => s.status === "scheduled").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Published</p>
            <p className="text-2xl font-bold text-gray-900">
              {slots.filter((s) => s.status === "published").length}
            </p>
          </div>
        </div>
      </div>

      {/* New Slot Modal */}
      {showNewSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule New Content</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
                <select
                  value={newSlot.persona_id}
                  onChange={(e) => setNewSlot({ ...newSlot, persona_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select persona...</option>
                  {personas.map((p) => (
                    <option key={p.persona_id} value={p.persona_id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newSlot.scheduled_date}
                    onChange={(e) => setNewSlot({ ...newSlot, scheduled_date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newSlot.scheduled_time}
                    onChange={(e) => setNewSlot({ ...newSlot, scheduled_time: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select
                    value={newSlot.platform}
                    onChange={(e) => setNewSlot({ ...newSlot, platform: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select platform...</option>
                    {PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                  <select
                    value={newSlot.content_type}
                    onChange={(e) => setNewSlot({ ...newSlot, content_type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select type...</option>
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newSlot.title}
                  onChange={(e) => setNewSlot({ ...newSlot, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Content title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newSlot.description}
                  onChange={(e) => setNewSlot({ ...newSlot, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 h-24"
                  placeholder="Brief description or script notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newSlot.status}
                  onChange={(e) => setNewSlot({ ...newSlot, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewSlot(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createSlot}
                disabled={!newSlot.persona_id || !newSlot.scheduled_date || !newSlot.platform}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Create Content Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot Detail Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedSlot.title || "Untitled"}</h2>
              <span className={`px-2 py-1 rounded text-sm ${getStatusStyle(selectedSlot.status)}`}>
                {selectedSlot.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Persona</p>
                  <p className="font-medium">
                    {personas.find((p) => p.persona_id === selectedSlot.persona_id)?.name || selectedSlot.persona_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Platform</p>
                  <p className="font-medium">
                    {PLATFORMS.find((p) => p.id === selectedSlot.platform)?.icon}{" "}
                    {PLATFORMS.find((p) => p.id === selectedSlot.platform)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{selectedSlot.content_type}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="font-medium">
                  {selectedSlot.scheduled_date} at {selectedSlot.scheduled_time || "No time set"}
                </p>
              </div>

              {selectedSlot.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-900">{selectedSlot.description}</p>
                </div>
              )}

              {selectedSlot.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-900">{selectedSlot.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Generate Content
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}