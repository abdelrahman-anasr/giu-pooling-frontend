import React from "react";
import "../index.css";
import "../styles/Common.css";
import logo from "../images/giupooling.png"; // Ensure your logo is in `src/assets/`

const Header = () => {
  return (
    <nav style={{
      backgroundColor: "#000000",
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "15px 20px",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "60px",
      zIndex: 1000,
      borderBottom: "2px solid #FFD281"
    }}>
      <div className="navbar-left">
        <img src={logo} alt="Logo" style={{ width: "50px", height: "auto" }} />
      </div>
      <div className="navbar-center">
        <a 
          href="/" 
          style={{ 
            color: "#FFFFFF", 
            textDecoration: "none", 
            margin: "0 20px", 
            fontSize: "18px",
            position: "relative",
            paddingBottom: "5px"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderBottom = "2px solid #FFD281";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderBottom = "none";
          }}
        >
          Home
        </a>
        <a 
          href="/dashboard" 
          style={{ 
            color: "#FFFFFF", 
            textDecoration: "none", 
            margin: "0 20px", 
            fontSize: "18px",
            position: "relative",
            paddingBottom: "5px"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderBottom = "2px solid #FFD281";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderBottom = "none";
          }}
        >
          Dashboard
        </a>
        <a 
          href="/book" 
          style={{ 
            color: "#FFFFFF", 
            textDecoration: "none", 
            margin: "0 20px", 
            fontSize: "18px",
            position: "relative",
            paddingBottom: "5px"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderBottom = "2px solid #FFD281";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderBottom = "none";
          }}
        >
          Book
        </a>
      </div>
      <div className="navbar-right">
        <button 
          style={{ 
            background: "none", 
            border: "none", 
            color: "#FFFFFF", 
            fontSize: "20px", 
            marginLeft: "20px", 
            cursor: "pointer",
            position: "relative"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#FFD281";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#FFFFFF";
          }}
        >
          🔔
        </button>
        <button 
          style={{ 
            background: "none", 
            border: "none", 
            color: "#FFFFFF", 
            fontSize: "20px", 
            marginLeft: "20px", 
            cursor: "pointer",
            position: "relative"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#FFD281";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#FFFFFF";
          }}
        >
          👤
        </button>
      </div>
    </nav>
  );
};

export default Header;
