"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Account {
  account_id: string;
  persona_id: string;
  platform: string;
  email: string;
  handle: string;
  password_ref: string;
  gologin_profile_id: string;
  proxy_region: string;
  status: string;
  warmup_day: string;
  created_at: string;
  notes: string;
}

interface Persona {
  persona_id: string;
  name: string;
}

const PLATFORMS = [
  { id: "gmail", label: "Gmail", icon: "📧", color: "bg-red-100 text-red-800" },
  { id: "instagram", label: "Instagram", icon: "📸", color: "bg-pink-100 text-pink-800" },
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "bg-gray-900 text-white" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "bg-red-100 text-red-800" },
  { id: "twitter", label: "X / Twitter", icon: "🐦", color: "bg-blue-100 text-blue-800" },
  { id: "substack", label: "Substack", icon: "📝", color: "bg-orange-100 text-orange-800" },
];

const STATUS_OPTIONS = [
  { id: "planned", label: "Planned", color: "bg-gray-100 text-gray-800" },
  { id: "creating", label: "Creating", color: "bg-yellow-100 text-yellow-800" },
  { id: "warming", label: "Warming Up", color: "bg-blue-100 text-blue-800" },
  { id: "active", label: "Active", color: "bg-green-100 text-green-800" },
  { id: "suspended", label: "Suspended", color: "bg-red-100 text-red-800" },
  { id: "shadowbanned", label: "Shadowbanned", color: "bg-orange-100 text-orange-800" },
];

const PROXY_REGIONS = [
  { id: "US-NYC", label: "🇺🇸 New York" },
  { id: "US-LA", label: "🇺🇸 Los Angeles" },
  { id: "US-CHI", label: "🇺🇸 Chicago" },
  { id: "DE-BER", label: "🇩🇪 Berlin" },
  { id: "UK-LON", label: "🇬🇧 London" },
  { id: "HR-ZAG", label: "🇭🇷 Zagreb" },
];

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [filterPersona, setFilterPersona] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newAccount, setNewAccount] = useState({
    persona_id: "",
    platform: "",
    email: "",
    handle: "",
    password_ref: "",
    gologin_profile_id: "",
    proxy_region: "",
    status: "planned",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, personasRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/personas"),
      ]);
      const accountsData = await accountsRes.json();
      const personasData = await personasRes.json();

      setAccounts(Array.isArray(accountsData) ? accountsData : []);
      setPersonas(Array.isArray(personasData) ? personasData : []);
    } catch (err) {
      console.error(err);
      setAccounts([]);
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });

      if (res.ok) {
        setShowNewAccount(false);
        setNewAccount({
          persona_id: "",
          platform: "",
          email: "",
          handle: "",
          password_ref: "",
          gologin_profile_id: "",
          proxy_region: "",
          status: "planned",
          notes: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const filteredAccounts = safeAccounts.filter((acc) => {
    if (filterPersona !== "all" && acc.persona_id !== filterPersona) return false;
    if (filterPlatform !== "all" && acc.platform !== filterPlatform) return false;
    if (filterStatus !== "all" && acc.status !== filterStatus) return false;
    return true;
  });

  const getStatusStyle = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.id === status)?.color || "bg-gray-100 text-gray-800";
  };

  const getPlatformInfo = (platform: string) => {
    return PLATFORMS.find((p) => p.id === platform) || { icon: "❓", label: platform, color: "bg-gray-100" };
  };

  const getWarmupProgress = (day: string) => {
    const dayNum = parseInt(day) || 0;
    if (dayNum >= 21) return 100;
    return Math.round((dayNum / 21) * 100);
  };

  // Group accounts by persona
  const accountsByPersona = safeAccounts.reduce((acc, account) => {
    if (!acc[account.persona_id]) {
      acc[account.persona_id] = [];
    }
    acc[account.persona_id].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading accounts...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
              <p className="text-gray-600">Manage social media accounts, proxies, and warmup progress</p>
            </div>
            <button
              onClick={() => setShowNewAccount(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + New Account
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Accounts</p>
            <p className="text-2xl font-bold text-gray-900">{safeAccounts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {safeAccounts.filter((a) => a.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Warming Up</p>
            <p className="text-2xl font-bold text-blue-600">
              {safeAccounts.filter((a) => a.status === "warming").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Personas</p>
            <p className="text-2xl font-bold text-purple-600">
              {Object.keys(accountsByPersona).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Issues</p>
            <p className="text-2xl font-bold text-red-600">
              {safeAccounts.filter((a) => a.status === "suspended" || a.status === "shadowbanned").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
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
          </div>
        </div>

        {/* Accounts by Persona */}
        {filterPersona === "all" ? (
          // Grouped view
          <div className="space-y-6">
            {Object.entries(accountsByPersona).map(([personaId, personaAccounts]) => {
              const persona = personas.find((p) => p.persona_id === personaId);
              const filtered = personaAccounts.filter((acc) => {
                if (filterPlatform !== "all" && acc.platform !== filterPlatform) return false;
                if (filterStatus !== "all" && acc.status !== filterStatus) return false;
                return true;
              });

              if (filtered.length === 0) return null;

              return (
                <div key={personaId} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">
                      {persona?.name || personaId}
                    </h2>
                    <p className="text-purple-100 text-sm">
                      {filtered.length} account{filtered.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="divide-y">
                    {filtered.map((account) => (
                      <AccountRow key={account.account_id} account={account} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Flat list view
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y">
              {filteredAccounts.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No accounts found
                </div>
              ) : (
                filteredAccounts.map((account) => (
                  <AccountRow key={account.account_id} account={account} />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Account Modal */}
      {showNewAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Account</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
                <select
                  value={newAccount.persona_id}
                  onChange={(e) => setNewAccount({ ...newAccount, persona_id: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={newAccount.platform}
                  onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="account@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Handle / Username</label>
                <input
                  type="text"
                  value={newAccount.handle}
                  onChange={(e) => setNewAccount({ ...newAccount, handle: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GoLogin Profile ID</label>
                <input
                  type="text"
                  value={newAccount.gologin_profile_id}
                  onChange={(e) => setNewAccount({ ...newAccount, gologin_profile_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="From GoLogin app"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proxy Region</label>
                <select
                  value={newAccount.proxy_region}
                  onChange={(e) => setNewAccount({ ...newAccount, proxy_region: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900"
                >
                  <option value="">Select region...</option>
                  {PROXY_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newAccount.status}
                  onChange={(e) => setNewAccount({ ...newAccount, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-gray-900"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newAccount.notes}
                  onChange={(e) => setNewAccount({ ...newAccount, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 h-20"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewAccount(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createAccount}
                disabled={!newAccount.persona_id || !newAccount.platform}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Account Row Component
function AccountRow({ account }: { account: Account }) {
  const getPlatformInfo = (platform: string) => {
    const platforms: Record<string, { icon: string; label: string; color: string }> = {
      gmail: { icon: "📧", label: "Gmail", color: "bg-red-100 text-red-800" },
      instagram: { icon: "📸", label: "Instagram", color: "bg-pink-100 text-pink-800" },
      tiktok: { icon: "🎵", label: "TikTok", color: "bg-gray-900 text-white" },
      youtube: { icon: "▶️", label: "YouTube", color: "bg-red-100 text-red-800" },
      twitter: { icon: "🐦", label: "X", color: "bg-blue-100 text-blue-800" },
      substack: { icon: "📝", label: "Substack", color: "bg-orange-100 text-orange-800" },
    };
    return platforms[platform] || { icon: "❓", label: platform, color: "bg-gray-100" };
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      planned: "bg-gray-100 text-gray-800",
      creating: "bg-yellow-100 text-yellow-800",
      warming: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      shadowbanned: "bg-orange-100 text-orange-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getWarmupProgress = (day: string) => {
    const dayNum = parseInt(day) || 0;
    if (dayNum >= 21) return 100;
    return Math.round((dayNum / 21) * 100);
  };

  const platformInfo = getPlatformInfo(account.platform);
  const warmupProgress = getWarmupProgress(account.warmup_day);

  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
      {/* Platform Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${platformInfo.color}`}>
        {platformInfo.icon}
      </div>

      {/* Account Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">
            {account.handle || account.email || "Not set"}
          </p>
          <span className={`px-2 py-0.5 rounded text-xs ${getStatusStyle(account.status)}`}>
            {account.status}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {platformInfo.label} • {account.proxy_region || "No proxy"}
        </p>
      </div>

      {/* Warmup Progress */}
      {account.status === "warming" && (
        <div className="w-32">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Day {account.warmup_day || 0}</span>
            <span>{warmupProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${warmupProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* GoLogin Badge */}
      {account.gologin_profile_id && (
        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          GL: {account.gologin_profile_id.slice(0, 8)}...
        </div>
      )}

      {/* Actions */}
      <button className="text-gray-400 hover:text-gray-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  );
}