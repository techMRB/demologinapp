import React, { useState, useMemo, useEffect, useCallback } from "react";
import "./UserList.css";
import api from "../../client/axiosClient";
import { APIEndpoint } from "../../constant/constant";

const EMPTY_FORM = { userName: "", userEmail: "", userContact: "", userRole: "user" };

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const COLUMNS = [
  { key: "userName",    label: "User" },
  { key: "userRole",    label: "Role" },
  { key: "isVerified",  label: "Status" },
  { key: "userContact", label: "Contact" },
  { key: "actions",     label: "Actions", sortable: false },
];

export default function UserList() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage]       = useState(1);
  const [sort, setSort]       = useState({ key: "userName", dir: "asc" });
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(APIEndpoint.GET_ALL_USERS);
      const data = res.data;
      setUsers(Array.isArray(data) ? data : data?.users ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Filtered + sorted ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...users]
      .filter((u) =>
        (u.userName    ?? "").toLowerCase().includes(q) ||
        (u.userEmail   ?? "").toLowerCase().includes(q) ||
        (u.userRole    ?? "").toLowerCase().includes(q) ||
        (u.userContact ?? "").toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const av = String(a[sort.key] ?? "").toLowerCase();
        const bv = String(b[sort.key] ?? "").toLowerCase();
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [users, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const handleSort = (key) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
    setPage(1);
  };

  const sortIcon = (key) => {
    if (sort.key !== key) return <span className="ul-sort-icon">⇅</span>;
    return <span className="ul-sort-icon">{sort.dir === "asc" ? "↑" : "↓"}</span>;
  };

  /* ── Modal helpers ── */
  const openAdd  = () => { setForm(EMPTY_FORM); setModal({ type: "add" }); };
  const openEdit = (u) => { setForm({ userName: u.userName, userEmail: u.userEmail, userContact: u.userContact, userRole: u.userRole }); setModal({ type: "edit", user: u }); };
  const openView = (u) => setModal({ type: "view", user: u });
  const openDel  = (u) => setModal({ type: "delete", user: u });
  const closeModal = () => { setModal(null); setError(null); };

  const handleSave = async () => {
    if (!form.userName.trim() || !form.userEmail.trim()) return;
    setSaving(true);
    try {
      if (modal.type === "add") {
        await api.post(APIEndpoint.CREATE_USER, form);
      } else {
        await api.put(APIEndpoint.UPDATE_USER(modal.user._id), form);
      }
      await fetchUsers();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message ?? "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(APIEndpoint.DELETE_USER(modal.user._id));
      await fetchUsers();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message ?? "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const start = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1;
  const end   = Math.min(safePage * perPage, filtered.length);

  return (
    <>
      <div className="ul-header">
        <h2 className="ul-title">
          All Users <span style={{ color: "#a0b0c0", fontWeight: 400 }}>({filtered.length})</span>
        </h2>
        <button className="ul-add-btn" onClick={openAdd}>＋ Add New User</button>
      </div>

      {error && (
        <div style={{ background: "#fdecea", color: "#d93025", borderRadius: 8, padding: "0.7rem 1rem", marginBottom: "1rem", fontSize: "0.88rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d93025", fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div className="ul-card">
        {/* Toolbar */}
        <div className="ul-toolbar">
          <div className="ul-search-wrap">
            <span className="ul-search-icon">🔍</span>
            <input
              className="ul-search"
              placeholder="Search users…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="ul-per-page">
            Show
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
              {[5, 10, 25].map((n) => <option key={n}>{n}</option>)}
            </select>
            entries
          </div>
        </div>

        {/* Table */}
        <div className="ul-table-wrap">
          <table className="ul-table">
            <thead>
              <tr>
                {COLUMNS.map(({ key, label, sortable = true }) => (
                  <th
                    key={key}
                    className={`${sortable ? "sortable" : ""} ${sort.key === key ? `sort-${sort.dir}` : ""}`}
                    onClick={() => sortable && handleSort(key)}
                  >
                    {label}{sortable && sortIcon(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="ul-empty">⏳ Loading users…</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={5} className="ul-empty">No users found.</td></tr>
              ) : pageData.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="ul-user-cell">
                      <div className="ul-user-avatar">{initials(u.userName)}</div>
                      <div>
                        <div className="ul-user-name">{u.userName}</div>
                        <div className="ul-user-email">{u.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="ul-role">{u.userRole}</span></td>
                  <td>
                    <span className={`ul-badge ${u.isVerified ? "active" : "inactive"}`}>
                      {u.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td>{u.userContact ?? "—"}</td>
                  <td>
                    <div className="ul-actions">
                      <button className="ul-btn view"   onClick={() => openView(u)}>👁 View</button>
                      <button className="ul-btn edit"   onClick={() => openEdit(u)}>✏️ Edit</button>
                      <button className="ul-btn delete" onClick={() => openDel(u)}>🗑 Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ul-footer">
          <span className="ul-info">Showing {start}–{end} of {filtered.length} entries</span>
          <div className="ul-pagination">
            <button className="ul-page-btn" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>‹ Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`ul-page-btn ${p === safePage ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="ul-page-btn" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>Next ›</button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <div className="ul-modal-overlay" onClick={closeModal}>
          <div className="ul-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ul-modal-close" onClick={closeModal}>✕</button>

            {/* View */}
            {modal.type === "view" && (
              <>
                <h3>User Details</h3>
                {[
                  ["Name",     modal.user.userName],
                  ["Email",    modal.user.userEmail],
                  ["Contact",  modal.user.userContact ?? "—"],
                  ["Role",     modal.user.userRole],
                  ["Status",   modal.user.isVerified ? "Verified" : "Unverified"],
                ].map(([label, value]) => (
                  <div className="ul-view-row" key={label}>
                    <span className="ul-view-label">{label}</span>
                    <span className="ul-view-value">{value}</span>
                  </div>
                ))}
                <div className="ul-modal-actions">
                  <button className="ul-modal-cancel" onClick={closeModal}>Close</button>
                </div>
              </>
            )}

            {/* Add / Edit */}
            {(modal.type === "add" || modal.type === "edit") && (
              <>
                <h3>{modal.type === "add" ? "Add New User" : "Edit User"}</h3>
                {[
                  ["Name",    "userName",    "text",  "Full name"],
                  ["Email",   "userEmail",   "email", "Email address"],
                  ["Contact", "userContact", "text",  "Phone number"],
                ].map(([label, field, type, placeholder]) => (
                  <div className="ul-form-group" key={field}>
                    <label>{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="ul-form-group">
                  <label>Role</label>
                  <select value={form.userRole} onChange={(e) => setForm({ ...form, userRole: e.target.value })}>
                    {["admin", "user", "editor"].map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div className="ul-modal-actions">
                  <button className="ul-modal-cancel" onClick={closeModal}>Cancel</button>
                  <button className="ul-modal-save" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </>
            )}

            {/* Delete */}
            {modal.type === "delete" && (
              <>
                <h3>Delete User</h3>
                <p className="ul-confirm-text">
                  Are you sure you want to delete <strong>{modal.user.userName}</strong>? This action cannot be undone.
                </p>
                <div className="ul-modal-actions">
                  <button className="ul-modal-cancel" onClick={closeModal}>Cancel</button>
                  <button className="ul-modal-delete" onClick={handleDelete} disabled={saving}>
                    {saving ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
