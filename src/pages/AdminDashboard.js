/* eslint-disable no-unused-vars */

import { useQuery, useMutation, gql, ApolloClient, InMemoryCache, ApolloProvider, useLazyQuery } from "@apollo/client";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/shared.css";
import Header from "./Header";

const client = new ApolloClient({
  uri: "https://userservice-production-63de.up.railway.app/graphql",
  cache: new InMemoryCache(),
  credentials: "include",
});

const AdminDashboard = () => {
  
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
    
      <div className="page-container">
        <h2>Admin Dashboard</h2>
        <div className="dashboard-overview">
          <p>
            Welcome to the admin dashboard. Please select a section to manage:
          </p>
          <Header />
  
          <div className="dashboard-grid">
            <Link to="/bookings" className="dashboard-card">
              <div className="card-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3>Bookings</h3>
              <p>Manage ride bookings and requests</p>
            </Link>
  
            <Link to="/notifications" className="dashboard-card">
              <div className="card-icon">
                <i className="fas fa-bell"></i>
              </div>
              <h3>Notifications</h3>
              <p>Send and manage system notifications</p>
            </Link>
  
            <Link to="/payments" className="dashboard-card">
              <div className="card-icon">
                <i className="fas fa-credit-card"></i>
              </div>
              <h3>Payments</h3>
              <p>Track payment transactions</p>
            </Link>
  
            <Link to="/rides" className="dashboard-card">
              <div className="card-icon">
                <i className="fas fa-car"></i>
              </div>
              <h3>Ride Monitoring</h3>
              <p>Manage areas and ride information</p>
            </Link>
  
            <Link to="/users" className="dashboard-card">
              <div className="card-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>User Management</h3>
              <p>Manage users and requests</p>
            </Link>
          </div>
        </div>
      </div>
    );
  };


export default AdminDashboard;
