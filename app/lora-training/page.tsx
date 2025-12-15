"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LoRAImage {
  image_id: string;
  persona_id: string;
  bucket: string;
  prompt: string;
  caption: string;
  drive_url: string;
  drive_file_id: string;
  version_target: string;
  status: string;
  score_identity: string;
  score_style: string;
  notes: string;
  created_at: string;
}

interface Persona {
  persona_id: string;
  name: string;
}

const BUCKETS = [
  { id: "A_identity", label: "A: Identity Lock", target: 55, color: "bg-purple-100 text-purple-800" },
  { id: "B_3d_face", label: "B: 3D Face", target: 15, color: "bg-blue-100 text-blue-800" },
  { id: "C_body", label: "C: Body Link", target: 20, color: "bg-green-100 text-green-800" },
  { id: "D_expression", label: "D: Expressions", target: 10, color: "bg-orange-100 text-orange-800" },
];

const STATUS_OPTIONS = [
  { id: "generated", label: "Generated", color: "bg-gray-100 text-gray-800" },
  { id: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
  { id: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
  { id: "used", label: "Used in Training", color: "bg-purple-100 text-purple-800" },
];

const VERSION_OPTIONS = ["v0.1", "v0.2", "v0.3", "v1.0"];

export default function LoRATrainingPage() {
  const router = useRouter();
  const [images, setImages] = useState<LoRAImage[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingImage, setEditingImage] = useState<LoRAImage | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Filters
  const [filterPersona, setFilterPersona] = useState("all");
  const [filterBucket, setFilterBucket] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVersion, setFilterVersion] = useState("all");

  const emptyImage: LoRAImage = {
    image_id: "",
    persona_id: "",
    bucket: "A_identity",
    prompt: "",
    caption: "",
    drive_url: "",
    drive_file_id: "",
    version_target: "v0.1",
    status: "generated",
    score_identity: "",
    score_style: "",
    notes: "",
    created_at: "",
  };

  const [formData, setFormData] = useState<LoRAImage>(emptyImage);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [imagesRes, personasRes] = await Promise.all([
        fetch("/api/assets/lora"),
        fetch("/api/personas"),
      ]);
      const imagesData = await imagesRes.json();
      const personasData = await personasRes.json();

      setImages(Array.isArray(imagesData) ? imagesData : []);
      setPersonas(Array.isArray(personasData) ? personasData : []);
    } catch (err) {
      console.error(err);
      setImages([]);
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData(emptyImage);
    setEditingImage(null);
    setShowAddModal(true);
  };

  const openEditModal = (image: LoRAImage) => {
    setFormData(image);
    setEditingImage(image);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingImage(null);
    setFormData(emptyImage);
  };

  const saveImage = async () => {
    try {
      if (editingImage) {
        const res = await fetch(`/api/assets/lora/${editingImage.image_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          closeModal();
          fetchData();
        }
      } else {
        const res = await fetch("/api/assets/lora", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          closeModal();
          fetchData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    for (const imageId of selectedImages) {
      await fetch(`/api/assets/lora/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    }
    setSelectedImages(new Set());
    fetchData();
  };

  const toggleSelect = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const selectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map((img) => img.image_id)));
    }
  };

  const safeImages = Array.isArray(images) ? images : [];

  const filteredImages = safeImages.filter((img) => {
    if (filterPersona !== "all" && img.persona_id !== filterPersona) return false;
    if (filterBucket !== "all" && img.bucket !== filterBucket) return false;
    if (filterStatus !== "all" && img.status !== filterStatus) return false;
    if (filterVersion !== "all" && img.version_target !== filterVersion) return false;
    return true;
  });

  const getStatusStyle = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.id === status)?.color || "bg-gray-100 text-gray-800";
  };

  const getBucketStyle = (bucket: string) => {
    return BUCKETS.find((b) => b.id === bucket)?.color || "bg-gray-100 text-gray-800";
  };

  const getBucketStats = (personaId: string) => {
    const personaImages = safeImages.filter((img) => img.persona_id === personaId);
    return BUCKETS.map((bucket) => {
      const count = personaImages.filter((img) => img.bucket === bucket.id && img.status !== "rejected").length;
      const approved = personaImages.filter((img) => img.bucket === bucket.id && img.status === "approved").length;
      return { ...bucket, count, approved };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading LoRA training data...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">LoRA Training</h1>
              <p className="text-gray-600">Manage training images for persona LoRAs</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + Add Image
            </button>
          </div>
        </div>
      </div>

      {/* Bucket Progress (per persona) */}
      {filterPersona !== "all" && (
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Training Progress: {personas.find((p) => p.persona_id === filterPersona)?.name}
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {getBucketStats(filterPersona).map((bucket) => (
                <div key={bucket.id} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${bucket.color}`}>
                      {bucket.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {bucket.approved}/{bucket.target}
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${Math.min((bucket.approved / bucket.target) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{bucket.count} total</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Bulk Actions */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4 flex-wrap">
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
              value={filterBucket}
              onChange={(e) => setFilterBucket(e.target.value)}
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white"
            >
              <option value="all">All Buckets</option>
              {BUCKETS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
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

            <select
              value={filterVersion}
              onChange={(e) => setFilterVersion(e.target.value)}
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white"
            >
              <option value="all">All Versions</option>
              {VERSION_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            {selectedImages.size > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedImages.size} selected</span>
                <button
                  onClick={() => bulkUpdateStatus("approved")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => bulkUpdateStatus("rejected")}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={selectedImages.size === filteredImages.length && filteredImages.length > 0}
                onChange={selectAll}
                className="rounded"
              />
              Select All
            </label>
            <span className="text-sm text-gray-500">
              {filteredImages.length} images
            </span>
          </div>

          {filteredImages.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No images found. Add your first training image!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
              {filteredImages.map((image) => (
                <div
                  key={image.image_id}
                  className={`relative border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedImages.has(image.image_id) ? "ring-2 ring-purple-500" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.image_id)}
                      onChange={() => toggleSelect(image.image_id)}
                      className="rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Image Preview */}
                  <div
                    onClick={() => openEditModal(image)}
                    className="aspect-square bg-gray-100 flex items-center justify-center"
                  >
                    {image.drive_url ? (
                      <img
                        src={image.drive_url}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 text-xs text-center px-2">
                        No preview
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2" onClick={() => openEditModal(image)}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${getBucketStyle(image.bucket)}`}>
                        {image.bucket.split("_")[0]}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusStyle(image.status)}`}>
                        {image.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{image.prompt || "No prompt"}</p>
                    {image.score_identity && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>ID: {image.score_identity}/5</span>
                        <span>Style: {image.score_style}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingImage ? "Edit Training Image" : "Add Training Image"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
                <select
                  value={formData.persona_id}
                  onChange={(e) => setFormData({ ...formData, persona_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Bucket</label>
                <select
                  value={formData.bucket}
                  onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900"
                >
                  {BUCKETS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version Target</label>
                <select
                  value={formData.version_target}
                  onChange={(e) => setFormData({ ...formData, version_target: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900"
                >
                  {VERSION_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Generation Prompt</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 h-20"
                  placeholder="The prompt used to generate this image..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">LoRA Caption</label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 h-20 font-mono text-sm"
                  placeholder="<alma_sevdah>, young adult woman, [facial invariants]..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drive URL</label>
                <input
                  type="url"
                  value={formData.drive_url}
                  onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drive File ID</label>
                <input
                  type="text"
                  value={formData.drive_file_id}
                  onChange={(e) => setFormData({ ...formData, drive_file_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="File ID from Drive"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score: Identity (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.score_identity}
                  onChange={(e) => setFormData({ ...formData, score_identity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score: Style (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.score_style}
                  onChange={(e) => setFormData({ ...formData, score_style: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 h-16"
                  placeholder="Any notes about this image..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveImage}
                disabled={!formData.persona_id}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {editingImage ? "Save Changes" : "Add Image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}