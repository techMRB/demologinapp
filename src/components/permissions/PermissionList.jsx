import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import "../users/UserList.css";
import "./PermissionList.css";
import api from "../../client/axiosClient";
import { APIEndpoint } from "../../constant/constant";
import CanAccess from "../CanAccess";

const ACTIONS = [
  { key: "read",   label: "Read" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
];

export default function PermissionList() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState("");
  const [expanded, setExpanded]       = useState({});
  const [modal, setModal]             = useState(null);
  const [saving, setSaving]           = useState(false);
  const [checkedActions, setCheckedActions] = useState({ read: true, create: true, update: true, delete: true });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const watchedLabel  = watch("label", "");
  const watchedModule = watch("module", "");

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await api.get(APIEndpoint.GET_ALL_PERMISSIONS);
      // GET_ALL_PERMISSIONS → { permissions: [{ _id, key, label, module, description, isSystem }] }
      setPermissions(res.data?.permissions ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  // Group by module, filtered by search
  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = permissions.filter((p) =>
      (p.label ?? "").toLowerCase().includes(q) ||
      (p.key ?? "").toLowerCase().includes(q) ||
      (p.module ?? "").toLowerCase().includes(q)
    );
    return filtered.reduce((acc, p) => {
      const mod = p.module ?? "other";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(p);
      return acc;
    }, {});
  }, [permissions, search]);

  const modules = Object.keys(grouped).sort();

  const toggleModule = (mod) =>
    setExpanded((prev) => ({ ...prev, [mod]: !prev[mod] }));

  const toggleAction = (key) =>
    setCheckedActions((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── Modals ── */
  const openAdd = () => {
    reset({ label: "", module: "", description: "" });
    setCheckedActions({ read: true, create: true, update: true, delete: true });
    setModal({ type: "add" });
  };

  const openEdit = (p) => {
    reset({ label: p.label, key: p.key, module: p.module, description: p.description });
    setModal({ type: "edit", item: p });
  };

  const openView = (p) => setModal({ type: "view", item: p });
  const openDel  = (p) => setModal({ type: "delete", item: p });
  const closeModal = () => { setModal(null); setError(null); };

  /* ── Submit: batch create or single edit ── */
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (modal.type === "add") {
        const selected = ACTIONS.filter((a) => checkedActions[a.key]);
        if (selected.length === 0) {
          setError("Select at least one action.");
          setSaving(false);
          return;
        }
        await Promise.all(
          selected.map((a) =>
            api.post(APIEndpoint.CREATE_PERMISSION, {
              label:       `${data.label} ${a.label}`,
              key:         `${data.module.toLowerCase().trim()}:${a.key}`,
              module:      data.module.toLowerCase().trim(),
              description: data.description,
            })
          )
        );
      } else {
        await api.put(APIEndpoint.UPDATE_PERMISSION(modal.item._id), data);
      }
      await fetchPermissions();
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
      await api.delete(APIEndpoint.DELETE_PERMISSION(modal.item._id));
      await fetchPermissions();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message ?? "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="ul-header">
        <h2 className="ul-title">
          All Permissions{" "}
          <span style={{ color: "#a0b0c0", fontWeight: 400 }}>({permissions.length})</span>
        </h2>
        <CanAccess permissions={["permission:create"]}>
          <button className="ul-add-btn" onClick={openAdd}>＋ Add Permission</button>
        </CanAccess>
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
              placeholder="Search permissions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "0.83rem", color: "#8a99aa" }}>
            {modules.length} module{modules.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Accordion */}
        <div className="pl-accordion">
          {loading ? (
            <div className="ul-empty">⏳ Loading permissions…</div>
          ) : modules.length === 0 ? (
            <div className="ul-empty">No permissions found.</div>
          ) : (
            modules.map((mod) => {
              const isOpen = !!expanded[mod];
              const items  = grouped[mod];
              return (
                <div key={mod} className="pl-group">
                  {/* Group header */}
                  <button className="pl-group-header" onClick={() => toggleModule(mod)}>
                    <div className="pl-group-left">
                      <span className="pl-chevron">{isOpen ? "▾" : "▸"}</span>
                      <span className="pl-group-name">{mod}</span>
                      <span className="pl-group-count">{items.length}</span>
                    </div>
                    <div className="pl-group-chips">
                      {items.slice(0, 4).map((p) => (
                        <span key={p._id} className="ul-role">{p.key.split(":")[1] ?? p.key}</span>
                      ))}
                      {items.length > 4 && <span className="ul-role">+{items.length - 4}</span>}
                    </div>
                  </button>

                  {/* Expanded rows */}
                  {isOpen && (
                    <div className="pl-group-body">
                      <table className="ul-table">
                        <thead>
                          <tr>
                            <th>Label</th>
                            <th>Key</th>
                            <th>Description</th>
                            <th>System</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((p) => (
                            <tr key={p._id}>
                              <td style={{ fontWeight: 600, color: "#1e2a3a" }}>{p.label}</td>
                              <td><span className="ul-role">{p.key}</span></td>
                              <td style={{ color: "#8a99aa", fontSize: "0.85rem" }}>{p.description || "—"}</td>
                              <td>
                                {p.isSystem
                                  ? <span className="ul-badge active">Yes</span>
                                  : <span className="ul-badge inactive">No</span>}
                              </td>
                              <td>
                                <div className="ul-actions">
                                  <CanAccess permissions={["permission:read"]}>
                                    <button className="ul-btn view" onClick={() => openView(p)}>👁 View</button>
                                  </CanAccess>
                                  <CanAccess permissions={["permission:update"]}>
                                    <button className="ul-btn edit" onClick={() => openEdit(p)} disabled={p.isSystem}>✏️ Edit</button>
                                  </CanAccess>
                                  <CanAccess permissions={["permission:delete"]}>
                                    <button className="ul-btn delete" onClick={() => openDel(p)} disabled={p.isSystem}>🗑 Delete</button>
                                  </CanAccess>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
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
                <h3>Permission Details</h3>
                {[
                  ["Label",       modal.item.label],
                  ["Key",         modal.item.key],
                  ["Module",      modal.item.module],
                  ["Description", modal.item.description || "—"],
                  ["System",      modal.item.isSystem ? "Yes" : "No"],
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

            {/* Add — batch create with action checkboxes */}
            {modal.type === "add" && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3>Add Permission</h3>

                <div className="ul-form-group">
                  <label>Module *</label>
                  <input
                    placeholder="e.g. users"
                    {...register("module", { required: "Module is required" })}
                  />
                  {errors.module && <span style={{ color: "#d93025", fontSize: "0.78rem" }}>{errors.module.message}</span>}
                </div>

                <div className="ul-form-group">
                  <label>Label (base name) *</label>
                  <input
                    placeholder="e.g. User"
                    {...register("label", { required: "Label is required" })}
                  />
                  {errors.label && <span style={{ color: "#d93025", fontSize: "0.78rem" }}>{errors.label.message}</span>}
                </div>

                <div className="ul-form-group">
                  <label>Description</label>
                  <input placeholder="Optional description" {...register("description")} />
                </div>

                {/* Action checkboxes */}
                <div className="ul-form-group">
                  <label>Actions *</label>
                  <div className="pl-action-grid">
                    {ACTIONS.map((a) => {
                      const permKey   = `${(watchedModule || "module").toLowerCase().trim()}:${a.key}`;
                      const permLabel = `${watchedLabel || "…"} ${a.label}`;
                      return (
                        <label key={a.key} className={`pl-action-card ${checkedActions[a.key] ? "checked" : ""}`}>
                          <input
                            type="checkbox"
                            checked={checkedActions[a.key]}
                            onChange={() => toggleAction(a.key)}
                          />
                          <div className="pl-action-info">
                            <span className="pl-action-label">{permLabel}</span>
                            <span className="pl-action-key">{permKey}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="ul-modal-actions">
                  <button type="button" className="ul-modal-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="ul-modal-save" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                </div>
              </form>
            )}

            {/* Edit — single permission */}
            {modal.type === "edit" && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3>Edit Permission</h3>

                <div className="ul-form-group">
                  <label>Label *</label>
                  <input
                    placeholder="e.g. Read Users"
                    {...register("label", { required: "Label is required" })}
                  />
                  {errors.label && <span style={{ color: "#d93025", fontSize: "0.78rem" }}>{errors.label.message}</span>}
                </div>

                <div className="ul-form-group">
                  <label>Key *</label>
                  <input
                    placeholder="e.g. user:read"
                    {...register("key", {
                      required: "Key is required",
                      pattern: { value: /^[a-z0-9_:]+$/, message: "Lowercase letters, numbers, _ and : only" },
                    })}
                  />
                  {errors.key && <span style={{ color: "#d93025", fontSize: "0.78rem" }}>{errors.key.message}</span>}
                </div>

                <div className="ul-form-group">
                  <label>Module *</label>
                  <input
                    placeholder="e.g. users"
                    {...register("module", { required: "Module is required" })}
                  />
                  {errors.module && <span style={{ color: "#d93025", fontSize: "0.78rem" }}>{errors.module.message}</span>}
                </div>

                <div className="ul-form-group">
                  <label>Description</label>
                  <input placeholder="Optional description" {...register("description")} />
                </div>

                <div className="ul-modal-actions">
                  <button type="button" className="ul-modal-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="ul-modal-save" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                </div>
              </form>
            )}

            {/* Delete */}
            {modal.type === "delete" && (
              <>
                <h3>Delete Permission</h3>
                <p className="ul-confirm-text">
                  Are you sure you want to delete <strong>{modal.item.label}</strong>? This action cannot be undone.
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
