"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Job {
  job_id: string;
  persona_id: string;
  job_type: string;
  priority: string;
  status: string;
  scheduled_for: string;
  parameters: string;
  created_at: string;
  started_at: string;
  completed_at: string;
  result: string;
  error: string;
}

interface Persona {
  persona_id: string;
  name: string;
}

const JOB_TYPES = [
  { id: "image_gen", label: "Generate Images", icon: "🖼️" },
  { id: "video_gen", label: "Generate Video", icon: "🎬" },
  { id: "audio_gen", label: "Generate Audio", icon: "🎵" },
  { id: "post_instagram", label: "Post to Instagram", icon: "📸" },
  { id: "post_youtube", label: "Post to YouTube", icon: "▶️" },
  { id: "post_tiktok", label: "Post to TikTok", icon: "🎵" },
  { id: "batch_content", label: "Batch Content Gen", icon: "📦" },
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewJob, setShowNewJob] = useState(false);
  const [filter, setFilter] = useState<"all" | "queued" | "running" | "completed" | "failed">("all");

  const [newJob, setNewJob] = useState({
    persona_id: "",
    job_type: "",
    priority: "3",
    scheduled_for: "",
    parameters: {
      prompt: "",
      count: 1,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, personasRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/personas"),
      ]);
      const jobsData = await jobsRes.json();
      const personasData = await personasRes.json();
      
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setPersonas(Array.isArray(personasData) ? personasData : []);
    } catch (err) {
      console.error(err);
      setJobs([]);
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async () => {
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });
      
      if (res.ok) {
        setShowNewJob(false);
        setNewJob({
          persona_id: "",
          job_type: "",
          priority: "3",
          scheduled_for: "",
          parameters: { prompt: "", count: 1 },
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const safeJobs = Array.isArray(jobs) ? jobs : [];
  
  const filteredJobs = safeJobs.filter((job) => {
    if (filter === "all") return true;
    return job.status === filter;
  });

  const queuedCount = safeJobs.filter((j) => j.status === "queued").length;
  const runningCount = safeJobs.filter((j) => j.status === "running").length;
  const completedCount = safeJobs.filter((j) => j.status === "completed").length;
  const failedCount = safeJobs.filter((j) => j.status === "failed").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "queued": return "bg-yellow-100 text-yellow-800";
      case "running": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "1": return "Urgent";
      case "2": return "High";
      case "3": return "Normal";
      case "4": return "Low";
      case "5": return "Overnight";
      default: return "Normal";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading workflows...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-900 mb-4"
          >
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflows and Jobs</h1>
              <p className="text-gray-600">Queue, schedule, and monitor all generation jobs</p>
            </div>
            <button
              onClick={() => setShowNewJob(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + New Job
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Queued</p>
            <p className="text-2xl font-bold text-gray-900">{queuedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Running</p>
            <p className="text-2xl font-bold text-gray-900">{runningCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-gray-900">{failedCount}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(["all", "queued", "running", "completed", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-900 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Persona</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.job_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-gray-900">{job.job_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">
                        {personas.find((p) => p.persona_id === job.persona_id)?.name || job.persona_id}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">
                        {JOB_TYPES.find((t) => t.id === job.job_type)?.icon}{" "}
                        {JOB_TYPES.find((t) => t.id === job.job_type)?.label || job.job_type}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{getPriorityLabel(job.priority)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">
                        {job.created_at ? new Date(job.created_at).toLocaleString() : "-"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Job</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Persona</label>
                <select
                  value={newJob.persona_id}
                  onChange={(e) => setNewJob({ ...newJob, persona_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 bg-white"
                >
                  <option value="">Select persona...</option>
                  {personas.map((p) => (
                    <option key={p.persona_id} value={p.persona_id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Job Type</label>
                <select
                  value={newJob.job_type}
                  onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 bg-white"
                >
                  <option value="">Select type...</option>
                  {JOB_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Priority</label>
                <select
                  value={newJob.priority}
                  onChange={(e) => setNewJob({ ...newJob, priority: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 bg-white"
                >
                  <option value="1">1 - Urgent (run now)</option>
                  <option value="2">2 - High</option>
                  <option value="3">3 - Normal</option>
                  <option value="4">4 - Low</option>
                  <option value="5">5 - Overnight (batch)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Schedule For (optional)
                </label>
                <input
                  type="datetime-local"
                  value={newJob.scheduled_for}
                  onChange={(e) => setNewJob({ ...newJob, scheduled_for: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Prompt / Description</label>
                <textarea
                  value={newJob.parameters.prompt}
                  onChange={(e) =>
                    setNewJob({
                      ...newJob,
                      parameters: { ...newJob.parameters, prompt: e.target.value },
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 h-24 text-gray-900 bg-white"
                  placeholder="Describe what you want to generate..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Count</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newJob.parameters.count}
                  onChange={(e) =>
                    setNewJob({
                      ...newJob,
                      parameters: { ...newJob.parameters, count: parseInt(e.target.value) || 1 },
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewJob(false)}
                className="px-4 py-2 text-gray-900 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createJob}
                disabled={!newJob.persona_id || !newJob.job_type}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}