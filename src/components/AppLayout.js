import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaRegFileAlt,
  FaSlidersH,
  FaMoon,
  FaSun,
  FaBars,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaImages,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdEventAvailable } from "react-icons/md";

export const AppLayout = ({ children, darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const location = useLocation();
  const navigate = useNavigate();

  const routeTitles = {
    "/": "Templates",
    "/form-control": "Form Control",
    "/carousel-control": "Slider Control",
    "/event-control": "Event Control",
  };

  const currentRoute = routeTitles[location.pathname] || "";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className={`${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}
    >
      <aside
        className={`position-fixed top-0 start-0 h-100 p-3 transition-sidebar ${
          darkMode ? "bg-secondary" : "bg-dark"
        } text-white ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}
        style={{ width: sidebarOpen ? "250px" : "60px", zIndex: 1040 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">{sidebarOpen && "Admin Panel"}</h5>
          <button
            className="btn btn-sm btn-light d-none d-md-block"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <nav className="nav flex-column">
          <Link
            to="/"
            className={`nav-link ${
              location.pathname === "/"
                ? "bg-white text-dark rounded"
                : "text-white"
            }`}
          >
            <FaRegFileAlt className="me-2" />
            {sidebarOpen && "Template Create"}
          </Link>

          <Link
            to="/form-control"
            className={`nav-link ${
              location.pathname === "/form-control"
                ? "bg-white text-dark rounded"
                : "text-white"
            }`}
          >
            <FaSlidersH className="me-2" />
            {sidebarOpen && "Form Control"}
          </Link>

          <Link
            to="/carousel-control"
            className={`nav-link ${
              location.pathname === "/carousel-control"
                ? "bg-white text-dark rounded"
                : "text-white"
            }`}
          >
            <FaImages className="me-2" />
            {sidebarOpen && "Carousel Control"}
          </Link>
          <Link
            to="/event-control"
            className={`nav-link ${
              location.pathname === "/event-control"
                ? "bg-white text-dark rounded"
                : "text-white"
            }`}
          >
            <MdEventAvailable className="me-2" />
            {sidebarOpen && "Event Control"}
          </Link>
        </nav>
      </aside>

      <div style={{ marginLeft: sidebarOpen ? "250px" : "60px" }}>
        <header
          className={`position-fixed top-0 end-0 w-100 p-3 d-flex justify-content-between align-items-center ${
            darkMode
              ? "bg-dark border-bottom border-light"
              : "bg-white border-bottom"
          }`}
          style={{
            zIndex: 1030,
            marginLeft: sidebarOpen ? "250px" : "60px",
            height: "64px",
          }}
        >
          <div className="d-flex align-items-center">
            <button
              onClick={toggleSidebar}
              className={`btn btn-sm me-2 d-md-none ${
                darkMode ? "btn-light" : "btn-dark"
              }`}
            >
              <FaBars />
            </button>
            <h5 className="mb-0">
              Dashboard /{" "}
              <span style={{ fontSize: "16px" }}>{currentRoute}</span>
            </h5>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span>Hi</span>
            <FaUserCircle size={24} className="cursor-pointer me-3" />
            <button
              onClick={toggleDarkMode}
              className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              className="btn btn-outline-danger btn-sm d-flex align-items-center"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-1" />
              Logout
            </button>
          </div>
        </header>

        <main
          className="pt-5"
          style={{
            marginTop: "64px",
            padding: "1.5rem",
            minHeight: "calc(100vh - 64px)",
            overflowY: "auto",
            backgroundColor: darkMode ? "#1e1e1e" : "#f8f9fa",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
