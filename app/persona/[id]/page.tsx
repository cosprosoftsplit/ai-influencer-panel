"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Persona {
  persona_id: string;
  name: string;
  tagline: string;
  backstory: string;
  traits: string;
  ethics_guidelines: string;
  brand_colors: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function PersonaDetail() {
  const params = useParams();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("identity");

  useEffect(() => {
    fetch(`/api/personas/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPersona(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading persona...</p>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Persona not found</p>
      </div>
    );
  }

  const tabs = [
    { id: "identity", label: "Identity" },
    { id: "prompts", label: "Prompts" },
    { id: "voice", label: "Voice" },
    { id: "social", label: "Social Accounts" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {persona.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{persona.name}</h1>
              <p className="text-gray-600">{persona.tagline}</p>
            </div>
            <span
              className={`ml-4 px-3 py-1 rounded-full text-sm ${
                persona.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {persona.status || "unknown"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {activeTab === "identity" && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <p className="text-gray-900">{persona.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <p className="text-gray-900">{persona.tagline || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backstory</label>
              <p className="text-gray-900 whitespace-pre-wrap">{persona.backstory || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Traits</label>
              <div className="flex flex-wrap gap-2">
                {persona.traits ? (
                  persona.traits.split(",").map((trait) => (
                    <span
                      key={trait}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {trait.trim()}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">—</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ethics Guidelines</label>
              <p className="text-gray-900 whitespace-pre-wrap">{persona.ethics_guidelines || "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Colors</label>
              <p className="text-gray-900">{persona.brand_colors || "—"}</p>
            </div>
          </div>
        )}

        {activeTab === "prompts" && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Prompts will be loaded here...</p>
          </div>
        )}

        {activeTab === "voice" && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Voice profiles will be loaded here...</p>
          </div>
        )}

        {activeTab === "social" && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Social accounts will be loaded here...</p>
          </div>
        )}
      </div>
    </main>
  );
}