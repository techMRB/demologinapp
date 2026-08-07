import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPages.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">🔒</div>
        <h2 className="error-code">401</h2>
        <h3 className="error-title">Access Denied</h3>
        <p className="error-message">
          You are not authenticated to access this resource. Please log in to continue.
        </p>
        <button className="submit-button" onClick={() => navigate('/')}>
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
