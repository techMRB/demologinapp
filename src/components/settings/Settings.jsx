import React from "react";
import "../dashboard/Dashboard.css";

const settingsItems = [
  { label: "Update Profile",  icon: "👤" },
  { label: "Change Password", icon: "🔒" },
  { label: "Notifications",   icon: "🔔" },
  { label: "Privacy",         icon: "🛡️" },
];

export default function Settings() {
  return (
    <div className="db-settings">
      <div className="db-settings-grid">
        {settingsItems.map(({ label, icon }) => (
          <div key={label} className="db-settings-card">
            <span>{icon} {label}</span>
            <span className="db-settings-arrow">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
