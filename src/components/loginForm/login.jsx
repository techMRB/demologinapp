import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { APIEndpoint } from "../../constant/constant";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";

const LoginForm = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();

  const onFormSubmit = async (data) => {
    try {
      const response = await axios.post(APIEndpoint.LOGIN_URL, data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setIsLoading(true);
      console.log("response", response.data);
      if (response.status === 200) {
        reset();
        setIsLoading(false);
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(
          "Login failed. Please check your credentials and try again.",
        );
      }
    } catch (error) {
      // Handle backend errors
      if (error.response && error.response.data) {
        const backendErrors = error.response.data.errors || error.response.data;

        // Display each error in a toast
        Object.entries(backendErrors).forEach(([field, message]) => {
          toast.error(message);
        });
      } else {
        console.log("error", error.message);
        // Handle unexpected errors
        toast.error("An unexpected error occurred. Please try again.");
      }
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
