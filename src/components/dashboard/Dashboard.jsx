import React, { useState } from "react";
import "./Dashboard.css";
import { useAuth } from "../../authContext/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [activeLink, setActiveLink] = useState("dashboard");
  console.log("Authenticated User:", user);
  const stats = [
    { label: "Total Users", count: 1240, icon: "👥", color: "card-blue" },
    { label: "Total Blogs", count: 385, icon: "📝", color: "card-green" },
    { label: "Categories", count: 24, icon: "🗂️", color: "card-purple" },
  ];

  const navLinks = [
    { key: "dashboard", icon: "🏠", label: "Dashboard" },
    { key: "users", icon: "👥", label: "Users" },
    { key: "settings", icon: "⚙️", label: "Settings" },
    { key: "logout", icon: "🚪", label: "Logout" },
  ];

  const handleNav = async(key) => {
    if (key === "logout") {
      await logout();
      return;
    }
    setActiveLink(key);
  };

  return (
    <div className={`db-wrapper ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-sidebar-header">
          {!collapsed && <span className="db-brand">AdminPanel</span>}
          <button
            className="db-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <div className="db-profile">
          <div className="db-avatar">MR</div>
          {!collapsed && (
            <div className="db-profile-info">
              <span className="db-username">{user?.name}</span>
              <span className="db-role">Administrator</span>
            </div>
          )}
        </div>

        <nav className="db-nav">
          {navLinks.map(({ key, icon, label }) => (
            <button
              key={key}
              className={`db-nav-link ${activeLink === key ? "active" : ""} ${key === "logout" ? "logout" : ""}`}
              onClick={() => handleNav(key)}
            >
              <span className="db-nav-icon">{icon}</span>
              {!collapsed && <span className="db-nav-label">{label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="db-main">
        {/* Top Header */}
        <header className="db-header">
          <h1 className="db-page-title">
            {activeLink.charAt(0).toUpperCase() + activeLink.slice(1)}
          </h1>
          <div className="db-header-right">
            <span className="db-notification">🔔</span>
            <div className="db-header-avatar">MR</div>
          </div>
        </header>

        {/* Content Area */}
        <main className="db-content">
          {activeLink === "dashboard" && (
            <>
              <p className="db-welcome">
                Welcome back, {user?.name}! Here's what's happening.
              </p>
              <div className="db-cards">
                {stats.map(({ label, count, icon, color }) => (
                  <div key={label} className={`db-card ${color}`}>
                    <div className="db-card-icon">{icon}</div>
                    <div className="db-card-info">
                      <span className="db-card-count">
                        {count.toLocaleString()}
                      </span>
                      <span className="db-card-label">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeLink === "users" && (
            <div className="db-placeholder">
              <span>👥</span>
              <p>Users management coming soon.</p>
            </div>
          )}

          {activeLink === "settings" && (
            <div className="db-settings">
              <h2>Settings</h2>
              <div className="db-settings-grid">
                {[
                  "Update Profile",
                  "Change Password",
                  "Notifications",
                  "Privacy",
                ].map((item) => (
                  <div key={item} className="db-settings-card">
                    <span>{item}</span>
                    <span className="db-settings-arrow">›</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="db-footer">
          <span>
            © {new Date().getFullYear()} Tech MRB. All rights reserved.
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
