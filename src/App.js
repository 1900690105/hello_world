import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

// ─── Branch config ────────────────────────────────────────────────────────────
const BRANCH_META = {
  CSE: {
    label: "Computer Science",
    color: "bg-violet-100 text-violet-700 border-violet-200",
  },
  ECE: {
    label: "Electronics",
    color: "bg-sky-100    text-sky-700    border-sky-200",
  },
  MECH: {
    label: "Mechanical",
    color: "bg-amber-100  text-amber-700  border-amber-200",
  },
  CIVIL: {
    label: "Civil",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  IT: {
    label: "Information Tech",
    color: "bg-rose-100   text-rose-700   border-rose-200",
  },
};

const branchMeta = (branch) =>
  BRANCH_META[branch?.toUpperCase()] ?? {
    label: branch ?? "—",
    color: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };

const yearLabel = (y) =>
  ["", "1st Year", "2nd Year", "3rd Year", "4th Year"][y] ?? `Year ${y}`;

// ─── Avatar initials ──────────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-500",
  "from-sky-500 to-cyan-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
];

function avatar(name = "") {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : (name[0] ?? "?");
  const gradient =
    AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
  return { initials: initials.toUpperCase(), gradient };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-zinc-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-zinc-200" />
          <div className="h-3 w-1/2 rounded bg-zinc-100" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-zinc-100" />
        <div className="h-3 w-4/5 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4">🎓</span>
      <p className="text-lg font-semibold text-zinc-700">
        {query ? "No students match your search" : "No students found"}
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        {query
          ? "Try a different name, email, or branch."
          : "Add students to get started."}
      </p>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
      <span className="text-red-500 text-xl mt-0.5">⚠️</span>
      <div className="flex-1">
        <p className="font-semibold text-red-700">Failed to load students</p>
        <p className="text-sm text-red-500 mt-0.5">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="shrink-0 text-sm font-medium text-red-600 hover:text-red-800 underline underline-offset-2 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function StudentCard({ student }) {
  const { initials, gradient } = avatar(student.name);
  const branch = branchMeta(student.branch);

  return (
    <article className="group relative flex flex-col rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Subtle top accent */}
      <div
        className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`h-12 w-12 shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base select-none shadow-sm`}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-zinc-900 truncate text-base leading-tight">
            {student.name}
          </h2>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            ID: {student.id}
          </p>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-zinc-100 mb-4" />

      {/* Details */}
      <dl className="flex flex-col gap-2.5 text-sm flex-1">
        <div className="flex items-start gap-2">
          <span className="text-zinc-400 text-base leading-none mt-0.5">
            ✉️
          </span>
          <dd className="text-zinc-600 truncate">{student.email ?? "—"}</dd>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-zinc-400 text-base leading-none mt-0.5">
            📅
          </span>
          <dd className="text-zinc-600">{yearLabel(student.year)}</dd>
        </div>
      </dl>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${branch.color}`}
        >
          {branch.label}
        </span>
        <button
          className="text-xs text-zinc-400 hover:text-indigo-600 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
          aria-label={`View profile of ${student.name}`}
        >
          View →
        </button>
      </div>
    </article>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name | year | branch

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("students")
        .select("*")
        .order("name", { ascending: true });

      if (sbError) throw sbError;
      setStudents(data ?? []);
    } catch (err) {
      console.error(err);
      setError(err?.message ?? "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter
  const q = query.toLowerCase().trim();
  const filtered = students.filter(
    (s) =>
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.branch?.toLowerCase().includes(q),
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "year") return (a.year ?? 0) - (b.year ?? 0);
    if (sortBy === "branch")
      return (a.branch ?? "").localeCompare(b.branch ?? "");
    return (a.name ?? "").localeCompare(b.name ?? "");
  });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xl" aria-hidden="true">
                🎓
              </span>
              <span className="font-bold text-zinc-900 text-base tracking-tight">
                Student Directory
              </span>
            </div>
            {!loading && !error && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600">
                {filtered.length} / {students.length} students
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        {!loading && !error && students.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">
                🔍
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or branch…"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white py-2.5 pl-4 pr-8 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition cursor-pointer appearance-none"
              aria-label="Sort students by"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                backgroundSize: "16px",
              }}
            >
              <option value="name">Sort: Name</option>
              <option value="year">Sort: Year</option>
              <option value="branch">Sort: Branch</option>
            </select>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} onRetry={fetchStudents} />
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : sorted.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            sorted.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
