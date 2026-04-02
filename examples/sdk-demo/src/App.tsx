import { useState, useCallback, useEffect } from "react";
import "./index.css";
import { useAuth, useCollection } from "./hooks";
import { client } from "./client";

// ===== Toast ====
function ToastContainer({ toasts }: { toasts: { id: number; message: string; type: "success" | "error" }[] }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" ? "✓" : "✗"} {t.message}
        </div>
      ))}
    </div>
  );
}

// ===== Auth Screen =====
function AuthScreen({ onAuth }: { onAuth: () => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      onAuth();
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="sidebar-logo-icon" style={{ margin: "0 auto 12px", width: 48, height: 48, fontSize: 22 }}>R</div>
        </div>
        <h2 className="auth-title">{mode === "login" ? "Welcome back" : "Create account"}</h2>
        <p className="auth-subtitle">{mode === "login" ? "Sign in to your Rebase project" : "Start building with Rebase"}</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? <span className="spinner" /> : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          {mode === "login" ? (
            <>Don't have an account? <a onClick={() => setMode("register")}>Sign up</a></>
          ) : (
            <>Already have an account? <a onClick={() => setMode("login")}>Sign in</a></>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Collection Table =====
function CollectionView({ slug, label }: { slug: string; label: string }) {
  const [page, setPage] = useState(1);
  const { data, meta, loading, refetch } = useCollection(slug, { limit: 15, page });
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  // Derive columns from first entity's values
  const columns = data.length > 0 ? Object.keys(data[0].values).slice(0, 6) : [];

  const handleDelete = async (id: string | number) => {
    if (!confirm("Delete this record?")) return;
    try {
      await client.data.collection(slug).delete(id);
      toast("Record deleted");
      refetch();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleSave = async (values: Record<string, any>, id?: string | number) => {
    try {
      if (id !== undefined) {
        await client.data.collection(slug).update(id, values);
        toast("Record updated");
      } else {
        await client.data.collection(slug).create(values);
        toast("Record created");
      }
      setEditingEntity(null);
      setShowCreate(false);
      refetch();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(meta.total / 15));

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">{label}</h2>
          <p className="page-subtitle">{meta.total} records · page {page} of {totalPages}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add {label.slice(0, -1)}</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              {columns.map((col) => (
                <th key={col}>{col.replace(/_/g, " ")}</th>
              ))}
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + 2}>
                  <div className="loading-center"><span className="spinner" /> Loading…</div>
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2}>
                  <div className="table-empty">No records found. Click "Add" to create one.</div>
                </td>
              </tr>
            )}
            {!loading && data.map((entity) => (
              <tr key={entity.id}>
                <td className="cell-id">{entity.id}</td>
                {columns.map((col) => (
                  <td key={col}>{renderCellValue(entity.values[col], col)}</td>
                ))}
                <td>
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingEntity(entity)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entity.id)}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="table-pagination">
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
            <span>{page} / {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={!meta.hasMore} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        )}
      </div>

      {(editingEntity || showCreate) && (
        <EntityDialog
          entity={editingEntity}
          slug={slug}
          columns={editingEntity ? Object.keys(editingEntity.values) : columns}
          onSave={handleSave}
          onClose={() => { setEditingEntity(null); setShowCreate(false); }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  );
}

function renderCellValue(value: any, col: string): React.ReactNode {
  if (value === null || value === undefined) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  if (typeof value === "boolean") return value ? "✓ Yes" : "✗ No";
  if (col === "status" && typeof value === "string") {
    return <span className={`badge badge-${value}`}>{value}</span>;
  }
  if (typeof value === "object") return JSON.stringify(value).substring(0, 60);
  const str = String(value);
  return str.length > 80 ? str.substring(0, 80) + "…" : str;
}

// ===== Entity Dialog =====
function EntityDialog({
  entity,
  slug,
  columns,
  onSave,
  onClose,
}: {
  entity: any | null;
  slug: string;
  columns: string[];
  onSave: (values: Record<string, any>, id?: string | number) => Promise<void>;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(entity?.values ?? {});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(values, entity?.id);
    setSaving(false);
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">{entity ? `Edit #${entity.id}` : `New ${slug}`}</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            {columns.map((col) => (
              <div className="form-group" key={col}>
                <label className="form-label">{col.replace(/_/g, " ")}</label>
                {typeof values[col] === "boolean" ? (
                  <select
                    className="form-select"
                    value={String(values[col] ?? "")}
                    onChange={(e) => setValues({ ...values, [col]: e.target.value === "true" })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : col === "content" || col === "bio" ? (
                  <textarea
                    className="form-textarea"
                    value={values[col] ?? ""}
                    onChange={(e) => setValues({ ...values, [col]: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <input
                    className="form-input"
                    type="text"
                    value={values[col] ?? ""}
                    onChange={(e) => setValues({ ...values, [col]: e.target.value })}
                    placeholder={col}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : entity ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Main App =====
const COLLECTIONS = [
  { slug: "authors", label: "Authors", icon: "👤" },
  { slug: "posts", label: "Posts", icon: "📝" },
  { slug: "tags", label: "Tags", icon: "🏷️" },
  { slug: "profiles", label: "Profiles", icon: "📋" },
];

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [activeSlug, setActiveSlug] = useState("posts");

  useEffect(() => {
    if (user) setAuthenticated(true);
  }, [user]);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="loading-center"><span className="spinner" /> Initializing…</div>
      </div>
    );
  }

  if (!authenticated) {
    return <AuthScreen onAuth={() => setAuthenticated(true)} />;
  }

  const activeCollection = COLLECTIONS.find((c) => c.slug === activeSlug)!;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">R</div>
          <div>
            <h1>Rebase</h1>
            <span>SDK Demo</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Collections</div>
          {COLLECTIONS.map((col) => (
            <button
              key={col.slug}
              className={`sidebar-item ${activeSlug === col.slug ? "active" : ""}`}
              onClick={() => setActiveSlug(col.slug)}
            >
              <span className="sidebar-item-icon">{col.icon}</span>
              {col.label}
            </button>
          ))}
        </div>

        <div className="sidebar-spacer" />

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {(user.displayName || user.email || "?")[0].toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.displayName || "User"}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          </div>
        )}
        <button className="sidebar-item" onClick={signOut} style={{ marginTop: 8, color: "var(--danger)" }}>
          <span className="sidebar-item-icon">↳</span>
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <CollectionView key={activeSlug} slug={activeCollection.slug} label={activeCollection.label} />
      </main>
    </div>
  );
}
