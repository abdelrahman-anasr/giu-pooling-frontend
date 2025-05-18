import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    if (isOpen) setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" onClick={closeMenu}>
            <h1>Admin Panel</h1>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        {/* Navigation Tabs */}
        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link
              to="/bookings"
              className={`nav-link ${
                location.pathname === "/bookings" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              <i className="fas fa-calendar-check"></i>&nbsp;Bookings
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/notifications"
              className={`nav-link ${
                location.pathname === "/notifications" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              <i className="fas fa-bell"></i>&nbsp;Notifications
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/payments"
              className={`nav-link ${
                location.pathname === "/payments" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              <i className="fas fa-credit-card"></i>&nbsp;Payments
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/rides"
              className={`nav-link ${
                location.pathname === "/rides" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              <i className="fas fa-car-side"></i>&nbsp;Ride Monitoring
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/users"
              className={`nav-link ${
                location.pathname === "/users" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              <i className="fas fa-users-cog"></i>&nbsp;User Management
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
