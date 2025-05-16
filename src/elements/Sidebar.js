import React from "react";
import { useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faMoneyBill,
  faExclamationTriangle,
  faBell,
  faSignOutAlt,
  faCar,
  faChartLine,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import "../styles/Common.css";

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const isAdmin = user && user.role === "ADMIN";

  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: faHome },
    { path: "/profile", name: "Profile", icon: faUser },
    ...(isAdmin
      ? [
          { path: "/admin", name: "Admin", icon: faUserShield },
          { path: "/monitoring", name: "Monitoring", icon: faChartLine },
        ]
      : []),
    { path: "/payments", name: "Payments", icon: faMoneyBill },
    { path: "/complaints", name: "Complaints", icon: faExclamationTriangle },
    { path: "/notifications", name: "Notifications", icon: faBell },
    { path: "/vehicles", name: "Vehicles", icon: faCar },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="sidebar" style={{
      width: "250px",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      backgroundColor: "#FFFFFF",
      boxShadow: "0 0 20px rgba(0, 0, 0, 0.05)",
      zIndex: 10,
      paddingTop: "80px"
    }}>
      <div style={{ padding: "0 20px" }}>
        <div style={{ 
          textAlign: "center",
          marginBottom: "20px"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            margin: "0 auto",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #FFD281, #FFC44F)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
          }}>
            <FontAwesomeIcon icon={faUser} size="2x" style={{ color: "#000000" }} />
          </div>
          <h3 style={{ 
            marginTop: "10px", 
            fontSize: "16px", 
            fontWeight: "600",
            color: "#000000"
          }}>
            {user?.name || "User"}
          </h3>
          <p style={{ 
            fontSize: "14px", 
            color: "#666",
            marginTop: "4px",
            textTransform: "capitalize"
          }}>
            {user?.role?.toLowerCase() || "Role"}
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <p style={{ 
            fontSize: "12px", 
            fontWeight: "600", 
            color: "#666",
            marginBottom: "8px",
            paddingLeft: "12px",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            Main Menu
          </p>
          <nav>
            <ul style={{ 
              listStyle: "none", 
              padding: 0, 
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "2px"
            }}>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px",
                      textDecoration: "none",
                      color: isActive(item.path) ? "#000000" : "#666",
                      fontWeight: isActive(item.path) ? "600" : "400",
                      borderRadius: "8px",
                      backgroundColor: isActive(item.path) ? "#FFF8EF" : "transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={item.icon}
                      style={{
                        marginRight: "12px",
                        fontSize: "16px",
                        color: isActive(item.path) ? "#FFD281" : "#666",
                      }}
                    />
                    {item.name}
                    {isActive(item.path) && (
                      <div
                        style={{
                          width: "4px",
                          height: "20px",
                          backgroundColor: "#FFD281",
                          borderRadius: "2px",
                          marginLeft: "auto",
                        }}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "12px",
              fontWeight: "500",
              fontSize: "14px",
              color: "#D52029",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: "12px" }} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;