/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from "@apollo/client";
import UserList from "./admin/UserList";
import AccountRequests from "./admin/AccountRequests";
import ComplaintsPanel from "./admin/ComplaintsPanel";
import AdminResponses from "./admin/AdminResponses";
import CarManager from "./admin/CarManager";
import RequestManager from "./admin/RequestManager";
import CreateUserForm from "./admin/CreateUserForm";
import "../styles/Common.css";

// Apollo Client Setup
const client = new ApolloClient({
  uri: "https://userservice-production-63de.up.railway.app/graphql", // Ensure correct backend connection
  cache: new InMemoryCache(),
  credentials: "include",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const AdminUserManagement = ({ setHasData }) => {
  // Set hasData to true since we're always showing user management components
  useEffect(() => {
    if (setHasData) {
      setHasData(true);
    }
  }, [setHasData]);

  return (
    <ApolloProvider client={client}>
      <div>
        <div className="section-container">
          <div className="section-title">User Management</div>
          <UserList />
        </div>
        
        <div className="section-container">
          <div className="section-title">Account Requests</div>
          <AccountRequests />
        </div>
        
        <div className="section-container">
          <div className="section-title">Complaints</div>
          <ComplaintsPanel />
        </div>
        
        <div className="section-container">
          <div className="section-title">Admin Responses</div>
          <AdminResponses />
        </div>
        
        <div className="section-container">
          <div className="section-title">Car Management</div>
          <CarManager />
        </div>
        
        <div className="section-container">
          <div className="section-title">Request Management</div>
          <RequestManager />
        </div>
        
        <div className="section-container">
          <div className="section-title">Create New User</div>
          <CreateUserForm />
        </div>
      </div>
    </ApolloProvider>
  );
};

export default AdminUserManagement;