import React, { useState } from "react";
import "./Dashboard.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const navLinks = [
  { key: "dashboard", icon: "🏠", label: "Dashboard", path: "/dashboard" },
  { key: "users",     icon: "👥", label: "Users",     path: "/users" },
  { key: "settings",  icon: "⚙️", label: "Settings",  path: "/settings" },
  { key: "logout",    icon: "🚪", label: "Logout",    path: null },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey =
    navLinks.find((l) => l.path && location.pathname === l.path)?.key ?? "dashboard";

  const pageTitle =
    navLinks.find((l) => l.key === activeKey)?.label ?? "Dashboard";

  const userInitials = (user?.userName ?? "?")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleNav = async (link) => {
    if (link.key === "logout") {
      await logout();
      navigate("/");
      return;
    }
    navigate(link.path);
  };

  return (
    <div className={`db-wrapper ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-sidebar-header">
          {!collapsed && <span className="db-brand">AdminPanel</span>}
          <button className="db-toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <div className="db-profile">
          <div className="db-avatar">{userInitials}</div>
          {!collapsed && (
            <div className="db-profile-info">
              <span className="db-username">{user?.userName ?? "User"}</span>
              <span className="db-role">{user?.userRole ?? "—"}</span>
            </div>
          )}
        </div>

        <nav className="db-nav">
          {navLinks.map((link) => (
            <button
              key={link.key}
              className={`db-nav-link ${activeKey === link.key ? "active" : ""} ${link.key === "logout" ? "logout" : ""}`}
              onClick={() => handleNav(link)}
            >
              <span className="db-nav-icon">{link.icon}</span>
              {!collapsed && <span className="db-nav-label">{link.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="db-main">
        <header className="db-header">
          <h1 className="db-page-title">{pageTitle}</h1>
          <div className="db-header-right">
            <span className="db-notification">🔔</span>
            <div className="db-header-avatar">{userInitials}</div>
          </div>
        </header>

        <main className="db-content">
          <Outlet />
        </main>

        <footer className="db-footer">
          <span>© {new Date().getFullYear()} Tech MRB. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
