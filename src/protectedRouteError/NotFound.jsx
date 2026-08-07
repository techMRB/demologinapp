import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPages.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">🗺️</div>
        <h2 className="error-code">404</h2>
        <h3 className="error-title">Page Not Found</h3>
        <p className="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="error-buttons">
          <button className="submit-button" onClick={() => navigate(-1)}>
            Go Back
          </button>
          <button className="outline-button" onClick={() => navigate('/')}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
