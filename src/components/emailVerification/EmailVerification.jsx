import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { APIEndpoint } from "../../constant/constant";
import "./EmailVerification.css";

const EmailVerification = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying your email...");
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing verification token.");
      return;
    }

    axios
      .get(`${APIEndpoint.VERIFY_EMAIL}/${token}`)
      .then((res) => {
        setMessage(
          "Your email has been successfully verified! You can now log in to your account.",
        );
        setStatus("success");
        setVerified(true);
      })
      .catch((err) => {
        setStatus("error");
        setMessage("Verification failed. The link may be expired or invalid.");
      });
  }, [token]);

  return (
    <div className="verification-container">
      <div className="verification-card">
        {status === "loading" && (
          <>
            <div className="verification-icon loading-icon">⏳</div>
            <h2>Verifying your email...</h2>
            <p>Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="verification-icon success-icon">✅</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <button className="submit-button" onClick={() => navigate("/")}>
              Go to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="verification-icon error-icon">❌</div>
            <h2>Verification Failed</h2>
            <p className="error-message">{message}</p>
            <button
              className="submit-button"
              onClick={() => navigate("/register")}
            >
              Back to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
