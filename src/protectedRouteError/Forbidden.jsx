import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ErrorPages.css";

const ACCESS_ERRORS = [
  {
    code: "403",
    icon: "🚫",
    title: "Forbidden",
    message: "You don't have permission to access this page. Contact your administrator if you believe this is a mistake.",
  },
  {
    code: "403",
    icon: "👮",
    title: "Insufficient Role",
    message: "Your current role does not have the required privileges to perform this action.",
  },
  {
    code: "403",
    icon: "🔐",
    title: "Resource Locked",
    message: "This resource is restricted. You need elevated permissions to view or modify it.",
  },
  {
    code: "403",
    icon: "⛔",
    title: "Action Not Allowed",
    message: "You are not authorized to perform this operation. Please request access from your admin.",
  },
];

const Forbidden = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Allow passing a specific variant via location state, default to first
  const variant = location.state?.variant ?? 0;
  const [active] = useState(Math.min(variant, ACCESS_ERRORS.length - 1));
  const { code, icon, title, message } = ACCESS_ERRORS[active];

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">{icon}</div>
        <h2 className="error-code forbidden-code">{code}</h2>
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{message}</p>

        <div className="forbidden-reasons">
          <p className="forbidden-reasons-title">This may happen because:</p>
          <ul className="forbidden-reasons-list">
            <li>Your account role lacks the required permissions</li>
            <li>The resource requires admin or elevated access</li>
            <li>Your session may have changed — try logging out and back in</li>
            <li>The action is restricted to specific users only</li>
          </ul>
        </div>

        <div className="error-buttons">
          <button className="submit-button" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
          <button className="outline-button" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
