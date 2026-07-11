import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../../authContext/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import api from "../../client/axiosClient";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";

const LoginForm = () => {
  const { login, sessionMessage, clearSessionMessage } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    toast.error(sessionMessage)
    return () => clearSessionMessage(); // Clear session message on unmount
  }, [clearSessionMessage]);

  const onFormSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      reset()
      navigate("/dashboard");
    
    } catch (error) {
      console.log("Error", error.response?.status, error.response?.data)
      const backendData = error.response?.data
      const message = backendData?.message || "An unexpected error occurred. Please try again."
      toast.error(message)
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="login-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="login-form">
        <h2 className="text-center mb-4">Login </h2>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="form-group">
            <label htmlForm="email">Email</label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              placeholder="Enter your email address"
              className="form-control"
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
              placeholder="enter your password"
              className="form-control"
            />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>
          <div className="button-group">
            <button type="submit" className="submit-button">
              Login
            </button>
          </div>
          <p style={{ textAlign: "center", marginTop: "0.75rem" }}>OR</p>
          <div className="button-group" style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/register")}
            >
              Create an Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
