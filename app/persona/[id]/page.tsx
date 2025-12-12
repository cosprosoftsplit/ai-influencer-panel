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
}

interface Prompt {
  prompt_id: string;
  prompt_type: string;
  prompt_name: string;
  prompt_text: string;
  parameters: string;
  is_active: string;
  version: string;
}

interface Voice {
  voice_id: string;
  provider: string;
  voice_name: string;
  stability: string;
  similarity_boost: string;
  style: string;
  default_language: string;
  notes: string;
}

interface Social {
  account_id: string;
  platform: string;
  handle: string;
  profile_url: string;
  api_connected: string;
  notes: string;
}

export default function PersonaDetail() {
  const params = useParams();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("identity");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personaRes, promptsRes, voicesRes, socialsRes] = await Promise.all([
          fetch(`/api/personas/${params.id}`),
          fetch(`/api/personas/${params.id}/prompts`),
          fetch(`/api/personas/${params.id}/voice`),
          fetch(`/api/personas/${params.id}/social`),
        ]);

        setPersona(await personaRes.json());
        setPrompts(await promptsRes.json());
        setVoices(await voicesRes.json());
        setSocials(await socialsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    { id: "prompts", label: `Prompts (${prompts.length})` },
    { id: "voice", label: `Voice (${voices.length})` },
    { id: "social", label: `Social (${socials.length})` },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2"
          >
            Back to Dashboard
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
          <div className="space-y-4">
            {prompts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">No prompts yet</p>
              </div>
            ) : (
              prompts.map((prompt) => (
                <div key={prompt.prompt_id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{prompt.prompt_name}</h3>
                      <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1 inline-block">
                        {prompt.prompt_type}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        prompt.is_active === "TRUE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {prompt.is_active === "TRUE" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded font-mono text-sm">
                    {prompt.prompt_text}
                  </p>
                  {prompt.parameters && (
                    <p className="text-gray-500 text-sm mt-2">
                      Parameters: {prompt.parameters}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "voice" && (
          <div className="space-y-4">
            {voices.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">No voice profiles yet</p>
              </div>
            ) : (
              voices.map((voice) => (
                <div key={voice.voice_id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{voice.voice_name}</h3>
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {voice.provider}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Stability</p>
                      <p className="font-medium">{voice.stability}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Similarity</p>
                      <p className="font-medium">{voice.similarity_boost}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Style</p>
                      <p className="font-medium">{voice.style}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Language</p>
                      <p className="font-medium">{voice.default_language}</p>
                    </div>
                  </div>
                  {voice.notes && (
                    <p className="text-gray-600 mt-4 text-sm">{voice.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "social" && (
          <div className="space-y-4">
            {socials.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">No social accounts yet</p>
              </div>
            ) : (
              socials.map((social) => (
                <div key={social.account_id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-white font-bold">
                        {social.platform.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{social.handle}</h3>
                        <p className="text-sm text-gray-500">{social.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          social.api_connected === "TRUE"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {social.api_connected === "TRUE" ? "Connected" : "Not Connected"}
                      </span>
                      <a
                        href={social.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Visit
                      </a>
                    </div>
                  </div>
                  {social.notes && (
                    <p className="text-gray-600 mt-4 text-sm">{social.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
