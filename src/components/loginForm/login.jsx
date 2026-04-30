import React from "react";
import { useForm } from "react-hook-form";
// import { Form, Button, Container, Row, Col } from "react-bootstrap";
import "./login.css";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="text-center mb-4">Login </h2>
        <form onSubmit={handleSubmit(console.log("form submitted"))}>
          <div className="form-group">
            <label htmlForm="email">Email</label>
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
              className="form-control"
            />
            {errors.user_email && (
              <p className="error-message">{errors.user_email.message}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="user_password"
              {...register("user_password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
              })}
              placeholder="enter your password"
              className="form-control"
            />
            {errors.user_password && (
              <p className="error-message">{errors.user_password.message}</p>
            )}
          </div>
          <div className="button-group">
            <button type="submit" className="submit-button">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
