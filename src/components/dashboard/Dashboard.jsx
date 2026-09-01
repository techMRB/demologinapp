import React from "react";
import { useAuth } from "../../context/AuthContext";

const stats = [
  { label: "Total Users", count: 1240, icon: "👥", color: "card-blue" },
  { label: "Total Blogs", count: 385,  icon: "📝", color: "card-green" },
  { label: "Categories",  count: 24,   icon: "🗂️", color: "card-purple" },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <p className="db-welcome">
        Welcome back, {user?.userName ?? "User"}! Here's what's happening.
      </p>
      <div className="db-cards">
        {stats.map(({ label, count, icon, color }) => (
          <div key={label} className={`db-card ${color}`}>
            <div className="db-card-icon">{icon}</div>
            <div className="db-card-info">
              <span className="db-card-count">{count.toLocaleString()}</span>
              <span className="db-card-label">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Dashboard;
