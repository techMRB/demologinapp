import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import "../users/UserList.css";
import "./RoleList.css";
import api from "../../client/axiosClient";
import { APIEndpoint } from "../../constant/constant";
import CanAccess from "../CanAccess";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "permissions", label: "Permissions", sortable: false },
  { key: "isSystem", label: "System", sortable: false },
  { key: "actions", label: "Actions", sortable: false },
];

export default function RoleList() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedPerms, setSelectedPerms]   = useState([]);
  const [expandedMods, setExpandedMods]     = useState({});

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rolesRes = await api.get(APIEndpoint.GET_ALL_ROLES);
      // GET_ALL_ROLES → { roles: [{ _id, name, description, permissions: [...objects], isSystem }] }
      setRoles(rolesRes.data?.roles ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const permsRes = await api.get(APIEndpoint.GET_ALL_PERMISSIONS);
      // GET_ALL_PERMISSIONS → { permissions: [{ _id, key, label, module, description, isSystem }] }
      setAllPermissions(permsRes.data?.permissions ?? []);
    } catch {
      setAllPermissions([]);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...roles]
      .filter((r) =>
        (r.name ?? "").toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const av = String(a[sort.key] ?? "").toLowerCase();
        const bv = String(b[sort.key] ?? "").toLowerCase();
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [roles, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const handleSort = (key) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
    setPage(1);
  };

  const sortIcon = (key) => {
    if (sort.key !== key) return <span className="ul-sort-icon">⇅</span>;
    return <span className="ul-sort-icon">{sort.dir === "asc" ? "↑" : "↓"}</span>;
  };

  const getPermIds = (role) =>
    (role.permissions ?? []).map((p) => (typeof p === "object" ? p._id : p));

  const openAdd = async () => {
    reset({ name: "", description: "" });
    setSelectedPerms([]);
    setExpandedMods({});
    await fetchPermissions();
    setModal({ type: "add" });
  };
  const openEdit = async (r) => {
    reset({ name: r.name, description: r.description });
    setSelectedPerms(getPermIds(r));
    setExpandedMods({});
    await fetchPermissions();
    setModal({ type: "edit", item: r });
  };
  const openView = (r) => setModal({ type: "view", item: r });
  const openDel = (r) => setModal({ type: "delete", item: r });
  const closeModal = () => { setModal(null); setError(null); };

  const togglePerm = (id) =>
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleMod = (mod) =>
    setExpandedMods((prev) => ({ ...prev, [mod]: !prev[mod] }));

  const toggleModAll = (mod, perms) => {
    const ids = perms.map((p) => p._id);
    const allChecked = ids.every((id) => selectedPerms.includes(id));
    setSelectedPerms((prev) =>
      allChecked ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, permissionIds: selectedPerms };
      if (modal.type === "add") {
        await api.post(APIEndpoint.CREATE_ROLE, payload);
      } else {
        await api.put(APIEndpoint.UPDATE_ROLE(modal.item._id), payload);
      }
      await fetchRoles();
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
      await api.delete(APIEndpoint.DELETE_ROLE(modal.item._id));
      await fetchRoles();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message ?? "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const resolvePermLabel = (p) =>
    typeof p === "object" ? (p.label ?? p.key) : (allPermissions.find((x) => x._id === p)?.label ?? p);

  const start = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1;
  const end = Math.min(safePage * perPage, filtered.length);

  const groupedPerms = useMemo(() =>
    allPermissions.reduce((acc, p) => {
      const mod = p.module ?? "other";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(p);
      return acc;
    }, {}),
    [allPermissions]
  );

  const sortedMods = useMemo(() => Object.keys(groupedPerms).sort(), [groupedPerms]);

  return (
    <>
      <div className="ul-header">
        <h2 className="ul-title">
          All Roles{" "}
          <span style={{ color: "#a0b0c0", fontWeight: 400 }}>({filtered.length})</span>
        </h2>
        <CanAccess permissions={["role:create"]}>
          <button className="ul-add-btn" onClick={openAdd}>＋ Add Role</button>
        </CanAccess>
      </div>

      {error && (
        <div style={{ background: "#fdecea", color: "#d93025", borderRadius: 8, padding: "0.7rem 1rem", marginBottom: "1rem", fontSize: "0.88rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d93025", fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div className="ul-card">
        <div className="ul-toolbar">
          <div className="ul-search-wrap">
            <span className="ul-search-icon">🔍</span>
            <input
              className="ul-search"
              placeholder="Search roles…"
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
                <tr><td colSpan={5} className="ul-empty">⏳ Loading roles…</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={5} className="ul-empty">No roles found.</td></tr>
              ) : (
                pageData.map((r) => (
                  <tr key={r._id}>
                    <td><span style={{ fontWeight: 600, color: "#1e2a3a", textTransform: "capitalize" }}>{r.name}</span></td>
                    <td style={{ color: "#8a99aa", fontSize: "0.85rem" }}>{r.description || "—"}</td>
                    <td>
                      <div className="rl-perm-chips">
                        {(r.permissions ?? []).slice(0, 3).map((p, i) => (
                          <span key={i} className="ul-role">{resolvePermLabel(p)}</span>
                        ))}
                        {(r.permissions ?? []).length > 3 && (
                          <span className="ul-role">+{r.permissions.length - 3} more</span>
                        )}
                        {(r.permissions ?? []).length === 0 && <span style={{ color: "#a0b0c0" }}>—</span>}
                      </div>
                    </td>
                    <td>
                      {r.isSystem
                        ? <span className="ul-badge active">Yes</span>
                        : <span className="ul-badge inactive">No</span>}
                    </td>
                    <td>
                      <div className="ul-actions">
                        <CanAccess permissions={["role:read"]}>
                          <button className="ul-btn view" onClick={() => openView(r)}>👁 View</button>
                        </CanAccess>
                        <CanAccess permissions={["role:update"]}>
                          <button className="ul-btn edit" onClick={() => openEdit(r)} disabled={r.isSystem}>✏️ Edit</button>
                        </CanAccess>
                        <CanAccess permissions={["role:delete"]}>
                          <button className="ul-btn delete" onClick={() => openDel(r)} disabled={r.isSystem}>🗑 Delete</button>
                        </CanAccess>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {modal && (
        <div className="ul-modal-overlay" onClick={closeModal}>
          <div className="ul-modal rl-modal-wide" onClick={(e) => e.stopPropagation()}>
            <button className="ul-modal-close" onClick={closeModal}>✕</button>

            {modal.type === "view" && (
              <>
                <h3>Role Details</h3>
                {[
                  ["Name", modal.item.name],
                  ["Description", modal.item.description || "—"],
                  ["System", modal.item.isSystem ? "Yes" : "No"],
                ].map(([label, value]) => (
                  <div className="ul-view-row" key={label}>
                    <span className="ul-view-label">{label}</span>
                    <span className="ul-view-value">{value}</span>
                  </div>
                ))}
                <div className="ul-view-row">
                  <span className="ul-view-label">Permissions</span>
                  <div className="rl-perm-chips" style={{ justifyContent: "flex-end" }}>
                    {(modal.item.permissions ?? []).length === 0
                      ? <span style={{ color: "#a0b0c0" }}>None</span>
                      : (modal.item.permissions ?? []).map((p, i) => (
                          <span key={i} className="ul-role">{resolvePermLabel(p)}</span>
                        ))}
                  </div>
                </div>
                <div className="ul-modal-actions">
                  <button className="ul-modal-cancel" onClick={closeModal}>Close</button>
                </div>
              </>
            )}

            {(modal.type === "add" || modal.type === "edit") && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3>{modal.type === "add" ? "Add Role" : "Edit Role"}</h3>

                <div className="rl-modal-scroll">
                  <div className="ul-form-group">
                    <label>Name *</label>
                    <input
                      placeholder="e.g. editor"
                      {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && <span style={{ color: "#d93025", fontSize: "0.78rem" }}>{errors.name.message}</span>}
                  </div>

                  <div className="ul-form-group">
                    <label>Description</label>
                    <input placeholder="Optional description" {...register("description")} />
                  </div>

                  <div className="ul-form-group">
                    <label>Permissions</label>
                    <div className="rl-perm-list">
                    {allPermissions.length === 0 ? (
                      <span style={{ color: "#a0b0c0", fontSize: "0.85rem" }}>No permissions available.</span>
                    ) : (
                      sortedMods.map((mod) => {
                        const perms      = groupedPerms[mod];
                        const ids        = perms.map((p) => p._id);
                        const allChecked = ids.every((id) => selectedPerms.includes(id));
                        const someChecked = ids.some((id) => selectedPerms.includes(id));
                        const isOpen     = !!expandedMods[mod];
                        return (
                          <div key={mod} className="rl-perm-group">
                            {/* Module header */}
                            <div className="rl-perm-group-header">
                              <button
                                type="button"
                                className="rl-perm-group-toggle"
                                onClick={() => toggleMod(mod)}
                              >
                                <span className="rl-chevron">{isOpen ? "▾" : "▸"}</span>
                                <span className="rl-mod-name">{mod}</span>
                                <span className="rl-mod-count">{perms.length}</span>
                              </button>
                              <label className="rl-select-all">
                                <input
                                  type="checkbox"
                                  checked={allChecked}
                                  ref={(el) => { if (el) el.indeterminate = !allChecked && someChecked; }}
                                  onChange={() => toggleModAll(mod, perms)}
                                />
                                <span>All</span>
                              </label>
                            </div>

                            {/* Permission rows */}
                            {isOpen && (
                              <div className="rl-perm-rows">
                                {perms.map((p) => (
                                  <label key={p._id} className="rl-perm-check">
                                    <input
                                      type="checkbox"
                                      checked={selectedPerms.includes(p._id)}
                                      onChange={() => togglePerm(p._id)}
                                    />
                                    <span className="rl-perm-label">{p.label}</span>
                                    <span className="rl-perm-key">{p.key}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    </div>
                  </div>
                </div>{/* end rl-modal-scroll */}

                <div className="ul-modal-actions">
                  <button type="button" className="ul-modal-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="ul-modal-save" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                </div>
              </form>
            )}

            {modal.type === "delete" && (
              <>
                <h3>Delete Role</h3>
                <p className="ul-confirm-text">
                  Are you sure you want to delete <strong>{modal.item.name}</strong>? This action cannot be undone.
                </p>
                <div className="ul-modal-actions">
                  <button className="ul-modal-cancel" onClick={closeModal}>Cancel</button>
                  <button className="ul-modal-delete" onClick={handleDelete} disabled={saving}>{saving ? "Deleting…" : "Delete"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
