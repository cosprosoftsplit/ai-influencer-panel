"use client";

import { useEffect, useState } from "react";

interface Persona {
  persona_id: string;
  name: string;
  tagline: string;
  backstory: string;
  traits: string;
  status: string;
  brand_colors: string;
}

export default function Home() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/personas")
      .then((res) => res.json())
      .then((data) => {
        setPersonas(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading personas...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Influencer Control Panel
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your digital personas, content, and workflows
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <div
              key={persona.persona_id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {persona.name?.charAt(0) || "?"}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    persona.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {persona.status || "unknown"}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                {persona.name}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{persona.tagline}</p>

              {persona.traits && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {persona.traits.split(",").slice(0, 3).map((trait) => (
                    <span
                      key={trait}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {trait.trim()}
                    </span>
                  ))}
                </div>
              )}

                          <button
              onClick={() => window.location.href = `/persona/${persona.persona_id}`}
              className="mt-6 w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Manage Persona
            </button>
            </div>
          ))}

          {/* Add New Persona Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-4">
              <span className="text-2xl">+</span>
            </div>
            <p className="font-medium">Add New Persona</p>
          </div>
        </div>
      </div>
    </main>
  );
}