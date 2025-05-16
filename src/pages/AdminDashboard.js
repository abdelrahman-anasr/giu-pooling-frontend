/* eslint-disable no-unused-vars */


import React, { useState } from "react";
import UserManagement from "../elements/UserManagement";
import RideMonitoring from "../elements/RideMonitoring";
import Payments from "../elements/Payments";
import Complaints from "../elements/Complaints";
import Notifications from "../elements/Notifications";
import "../index.css";
import "../styles/Common.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [hasData, setHasData] = useState(false); // Track if data exists

  return (
    <div className="main-container">
      <h2 className="main-title">Admin Dashboard</h2>
      
      <div className="section-container" style={{ padding: "1rem" }}> 
        <div className="tabs-container">
          <button 
            onClick={() => setActiveTab("users")} 
            className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab("rides")} 
            className={`tab-button ${activeTab === "rides" ? "active" : ""}`}
          >
            Ride Monitoring
          </button>
          <button 
            onClick={() => setActiveTab("payments")} 
            className={`tab-button ${activeTab === "payments" ? "active" : ""}`}
          >
            Payments &amp; Refunds
          </button>
          <button 
            onClick={() => setActiveTab("complaints")} 
            className={`tab-button ${activeTab === "complaints" ? "active" : ""}`}
          >
            Complaints
          </button>
          <button 
            onClick={() => setActiveTab("notifications")} 
            className={`tab-button ${activeTab === "notifications" ? "active" : ""}`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* Render the selected tab component and update hasData */}
      <div className="tab-content-container">
        {activeTab === "users" && <UserManagement setHasData={setHasData} />}
        {activeTab === "rides" && <RideMonitoring setHasData={setHasData} />}
        {activeTab === "payments" && <Payments setHasData={setHasData} />}
        {activeTab === "complaints" && <Complaints setHasData={setHasData} />}
        {activeTab === "notifications" && <Notifications setHasData={setHasData} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
