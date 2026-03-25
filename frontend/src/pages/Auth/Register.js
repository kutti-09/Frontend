// Register.jsx
import React from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { MediaTrackLogo } from "../MediaTrackLogo";
import { Link } from "react-router-dom";
// If you want the same logo at top-right, uncomment below and render it.
// import MediaTrackLogo from "./MediaTrackLogo";
import "./Login.css"; // reuse your existing styles

export const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: { name: "", email: "", phone: "", password: "" }
  });

  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    try {
      // POST the actual form data (body)
      const res = await axios.post("http://localhost:8082/user/add", formData);
      console.log("Register Success", res.data);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Register failed", err);
      // Optional: show a toast or inline error message
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <main className="auth-side">
        <div className="auth-card-header">
            <MediaTrackLogo />
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Create your account</h1>

          <div className="container">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Name */}
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full name"
                  className="form-control"
                  autoComplete="name"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" }
                })}
              />
              {errors.name && <p className="err">{errors.name.message}</p>}
          </div>

              {/* Email */}
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  className="form-control"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email"
                    }
                  })}
                />
                {errors.email && <p className="err">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="form-control"
                  autoComplete="tel"
                  {...register("phone", {
                    required: "Phone number is required",
                    // For India 10-digit rule, use: /^[6-9]\d{9}$/
                    pattern: {
                      value: /^\+?[0-9 -]{10,15}$/,
                      message: "Enter a valid phone number"
                    }
                  })}
                />
                {errors.phone && <p className="err">{errors.phone.message}</p>}
              </div>

              {/* Password */}
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  className="form-control"
                  autoComplete="new-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" }
                  })}
                />
                {errors.password && <p className="err">{errors.password.message}</p>}
              </div>

              <div className="form-group">
                <button type="submit" className="btn-primary-new" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
          
          <div className="login-link">
            Already have an account?{" "}
            <Link to="/" className="login-text">
              Login
            </Link>
          </div>
          
        </div>
      </main>
    </div>
  );
};

