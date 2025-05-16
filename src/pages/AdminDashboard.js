/* eslint-disable no-unused-vars */

import { useQuery, useMutation, gql, ApolloClient, InMemoryCache, ApolloProvider, useLazyQuery } from "@apollo/client";
import React, { useState } from "react";
import UserManagement from "../elements/UserManagement";
import RideMonitoring from "../elements/RideMonitoring";
import Payments from "../elements/Payments";
import Complaints from "../elements/Complaints";
import Notifications from "../elements/Notifications";
import "../index.css";
import "../styles/Common.css";

const client = new ApolloClient({
  uri: "https://userservice-production-63de.up.railway.app/graphql",
  cache: new InMemoryCache(),
  credentials: "include",
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [hasData, setHasData] = useState(false); // Track if data exists

  const FETCH_DETAILS_QUERY = gql`
    query FetchMyDetails {
      fetchMyDetails {
        id
        name
        email
        universityId
        gender
        phoneNumber
        isEmailVerified
        role
        createdAt
        updatedAt
      }
    }
  `;

  const {loading: fetchMyDetailsLoading, error: fetchMyDetailsError, data: fetchMyDetailsData} = useQuery(FETCH_DETAILS_QUERY, {client: client });

  if (fetchMyDetailsLoading) {
    return (
      <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
      </div>
    );
  }

  if (fetchMyDetailsError) {
    if(fetchMyDetailsError.message === "Unauthorized")
    {
      return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <div style={{width: 900, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
        </div>
      );
    }
    return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <div style={{width: 900, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
        </div>
    );
  }

  const user = fetchMyDetailsData.fetchMyDetails;
  const role = user.role;

  if(role !== "admin")
  {
    return (
      <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 900, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
      </div>
    );
  }
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
