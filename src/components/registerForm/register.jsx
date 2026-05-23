import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./register.css";
import axios from "axios";
import { APIEndpoint } from "../../constant/constant";

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(APIEndpoint.REGISTER, data);
      if (response.status === 201) {
        alert("Registration successful! Please log in.");
        navigate("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.", error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="user_name">Full Name</label>
            <input
              type="text"
              id="user_name"
              {...register("user_name", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              placeholder="Enter your full name"
              className={`form-control ${errors.user_name ? "is-invalid" : ""}`}
            />
            {errors.user_name && (
              <p className="error-message">{errors.user_name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="user_email">Email</label>
            <input
              type="email"
              id="user_email"
              {...register("user_email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              placeholder="Enter your email address"
              className={`form-control ${errors.user_email ? "is-invalid" : ""}`}
            />
            {errors.user_email && (
              <p className="error-message">{errors.user_email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="user_contact">Contact Number</label>
            <input
              type="tel"
              id="user_contact"
              {...register("user_contact", {
                required: "Contact number is required",
                pattern: {
                  value: /^(\+\d{1,3}[- ]?)?\d{10}$/,
                  message: "Enter a valid contact number (10 digits)",
                },
              })}
              placeholder="Enter your contact number"
              className={`form-control ${errors.user_contact ? "is-invalid" : ""}`}
            />
            {errors.user_contact && (
              <p className="error-message">{errors.user_contact.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="user_password">Password</label>
            <input
              type="password"
              id="user_password"
              {...register("user_password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              placeholder="Enter your password"
              className={`form-control ${errors.user_password ? "is-invalid" : ""}`}
            />
            {errors.user_password && (
              <p className="error-message">{errors.user_password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              type="password"
              id="confirm_password"
              {...register("confirm_password", {
                required: "Please confirm your password",
                validate: (val) =>
                  val === watch("user_password") || "Passwords do not match",
              })}
              placeholder="Confirm your password"
              className={`form-control ${errors.confirm_password ? "is-invalid" : ""}`}
            />
            {errors.confirm_password && (
              <p className="error-message">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="button-group">
            <button type="submit" className="submit-button" disabled={!isValid}>
              Register
            </button>
          </div>
          <div className="button-group">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/")}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
