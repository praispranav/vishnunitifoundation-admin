import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import TemplateCreate from "./pages/TemplateCreate";
import FormControl from "./pages/FormControl";
import CarouselControl from "./pages/CarouselControl";
import LoginPage from "./pages/LoginPage";
import './App.css';
import { AppLayout } from "./components/AppLayout";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventSliderControl from "./pages/EventSliderControl";


const LayoutWrapper = ({ children, darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";
  return isLoginRoute ? children : (
    <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      {children}
    </AppLayout>
  );
};

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const isLoggedIn = localStorage.getItem("logged") === "true";

  return (
    <Router>
      <LayoutWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? <TemplateCreate darkMode={darkMode} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/form-control"
            element={
              isLoggedIn ? <FormControl darkMode={darkMode} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/carousel-control"
            element={
              isLoggedIn ? <CarouselControl darkMode={darkMode} /> : <Navigate to="/login" replace />
            }
          />
            <Route
            path="/event-control"
            element={
              isLoggedIn ? <EventSliderControl darkMode={darkMode} /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </LayoutWrapper>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;
