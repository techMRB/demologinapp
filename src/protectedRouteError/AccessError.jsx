import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ErrorPages.css";

const ERROR_CONFIGS = {
  401: {
    code: "401",
    icon: "🔒",
    title: "Unauthorized",
    message: "You are not authenticated to access this resource. Please log in to continue.",
    codeClass: "code-401",
    reasons: [
      "You are not logged in or your session has expired",
      "Your login credentials may have changed",
      "Try logging out and signing in again",
    ],
    primaryLabel: "Go to Login",
    primaryPath: "/",
    secondaryLabel: null,
  },
  403: {
    code: "403",
    icon: "🚫",
    title: "Access Forbidden",
    message: "You don't have the required permissions to access this resource.",
    codeClass: "code-403",
    reasons: [
      "Your account role lacks the required permissions",
      "This resource is restricted to admin or elevated roles only",
      "Your session may have changed — try logging out and back in",
      "The action is restricted to specific users only",
    ],
    primaryLabel: "Back to Dashboard",
    primaryPath: "/dashboard",
    secondaryLabel: "Go Back",
  },
  404: {
    code: "404",
    icon: "🗺️",
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist or has been moved.",
    codeClass: "code-404",
    reasons: [
      "The URL may be incorrect or mistyped",
      "The page may have been moved or deleted",
      "You may not have access to view this page",
    ],
    primaryLabel: "Go Back",
    primaryPath: null,
    secondaryLabel: "Go to Login",
  },
};

const AccessError = ({ type = 403 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Allow overriding type via navigation state: navigate("/access-error", { state: { type: 401 } })
  const errorType = location.state?.type ?? type;
  const config = ERROR_CONFIGS[errorType] ?? ERROR_CONFIGS[403];

  const handlePrimary = () => {
    if (config.primaryPath) navigate(config.primaryPath);
    else navigate(-1);
  };

  const handleSecondary = () => {
    if (errorType === 404) navigate("/");
    else navigate(-1);
  };

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">{config.icon}</div>
        <h2 className={`error-code ${config.codeClass}`}>{config.code}</h2>
        <h3 className="error-title">{config.title}</h3>
        <p className="error-message">{config.message}</p>

        <div className="ae-reasons">
          <p className="ae-reasons-title">This may happen because:</p>
          <ul className="ae-reasons-list">
            {config.reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>

        <div className="error-buttons">
          <button className="submit-button" onClick={handlePrimary}>
            {config.primaryLabel}
          </button>
          {config.secondaryLabel && (
            <button className="outline-button" onClick={handleSecondary}>
              {config.secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessError;
