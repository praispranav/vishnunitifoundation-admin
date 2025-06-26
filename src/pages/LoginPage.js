import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserLock } from "react-icons/fa";

const LoginPage = () => {
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("logged") === "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (apiKey.trim()) {
      localStorage.setItem("logged", "true");
      localStorage.setItem("apiKey", apiKey.trim());
      navigate("/");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
      }}
    >
      <div
        className="card shadow-lg p-4 border-0"
        style={{ width: "100%", maxWidth: "400px", borderRadius: "1rem" }}
      >
        <div className="text-center mb-4">
          <FaUserLock size={40} className="text-primary mb-2" />
          <h4 className="fw-bold">Welcome</h4>
          <p className="text-muted small mb-0">Login with password</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control shadow-sm"
              placeholder="Enter Password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold"
            style={{ transition: "0.3s" }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
