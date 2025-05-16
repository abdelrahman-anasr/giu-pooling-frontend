import React, { useState } from "react";
import { useQuery, useMutation, gql, ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import "../../styles/Common.css";

// Apollo Client setup with enhanced debugging and error handling
const userClient = new ApolloClient({
  uri: "https://userservice-production-63de.up.railway.app/graphql", // Make sure this URL is correct
  cache: new InMemoryCache(),
  credentials: "include", // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
  request: operation => {
    // Add auth token to each request
    const token = localStorage.getItem("token");
    if (token) {
      console.log("🔑 Adding auth token to request", { operationName: operation.operationName });
    }
    operation.setContext({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
  // Log any errors that occur during the request/response cycle
  onError: (error) => {
    console.error("🔴 Apollo Client Error (Global)", error);
  },
  defaultOptions: {
    watchQuery: { 
      fetchPolicy: 'network-only', // Don't use cache for queries
      errorPolicy: 'all', // Show all errors
    },
    query: { 
      fetchPolicy: 'network-only', 
      errorPolicy: 'all',
    },
    mutate: { 
      fetchPolicy: 'no-cache', // Never cache mutations
      errorPolicy: 'all',
    },
  },
});

// Query to get all users - matches the schema from paste-2.txt
const GET_USERS = gql`
  query {
    users {
      id
      name
      email
      universityId
      gender
      phoneNumber
      role
      isEmailVerified
      createdAt
      updatedAt
    }
  }
`;

// Update mutation - fixed to match the schema from paste-2.txt
const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $name: String
    $email: String
    $universityId: String
    $phoneNumber: String
    $role: Role
    $isEmailVerified: Boolean
  ) {
    updateUser(
      id: $id
      name: $name
      email: $email
      universityId: $universityId
      phoneNumber: $phoneNumber
      role: $role
      isEmailVerified: $isEmailVerified
    ) {
      id
      name
      email
      universityId
      gender
      phoneNumber
      role
      isEmailVerified
      createdAt
      updatedAt
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

const roleColors = {
  admin: { bg: "rgba(237, 237, 237, 0.7)", text: "#000000" },
  driver: { bg: "rgba(255, 210, 129, 0.7)", text: "#000000" },
  student: { bg: "rgba(255, 255, 255, 0.7)", text: "#000000", border: "1px solid #EDEDED" }
};

// Enhanced debugging function
const debugLog = (message, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

const UserListContent = () => {
  const { loading, error, data, refetch } = useQuery(GET_USERS, {
    fetchPolicy: "network-only",
    onError: (error) => console.error("Error fetching users:", error)
  });

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleEdit = (user) => {
    setEditingUser(user.id);
    
    // Make sure to convert role to lowercase and validate it
    let lowerCaseRole = (user.role || "student").toLowerCase();
    
    // Ensure role is one of the valid options
    if (!["admin", "driver", "student"].includes(lowerCaseRole)) {
      debugLog(`⚠️ Invalid role '${lowerCaseRole}' found, defaulting to 'student'`);
      lowerCaseRole = "student";
    }
    
    // Initialize form with appropriate fields from schema
    setFormData({
      name: user.name || "",
      email: user.email || "",
      universityId: user.universityId || "",
      phoneNumber: user.phoneNumber || "",
      gender: user.gender || "male", // Keep for display only, not sent to backend
      role: lowerCaseRole,
      isEmailVerified: user.isEmailVerified || false
    });
  };

  const handleSave = async () => {
    try {
      // Clear any existing errors
      setErrorMessage("");
      
      // Basic validation
      if (!formData.name?.trim()) return setErrorMessage("Name is required");
      if (!formData.email?.trim()) return setErrorMessage("Email is required");
      if (!formData.universityId?.trim()) return setErrorMessage("University ID is required");
      
      // Prepare update variables - matching the schema from paste-2.txt
      const variables = {
        id: editingUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        universityId: formData.universityId.trim(),
        phoneNumber: formData.phoneNumber?.trim() || "",
        role: formData.role.toLowerCase(), // Ensure lowercase for enum
        isEmailVerified: !!formData.isEmailVerified
      };
      
      debugLog("🔵 Updating user with variables:", variables);
      
      // Execute mutation
      const { data } = await updateUser({ 
        variables,
        fetchPolicy: 'no-cache'
      });
      
      if (data?.updateUser) {
        setSuccessMessage("User updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setEditingUser(null);
        refetch();
      } else {
        setErrorMessage("Update returned no data. Please try again.");
      }
    } catch (error) {
      debugLog("🔴 Update error:", error);
      
      let errorMsg = "Failed to update user";
      
      if (error.graphQLErrors?.length > 0) {
        errorMsg = `GraphQL error: ${error.graphQLErrors[0].message}`;
      } else if (error.networkError) {
        errorMsg = `Network error: ${error.networkError.message || 'Connection failed'}`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setErrorMessage("");
      try {
        await deleteUser({ variables: { id: id.toString() } });
        setSuccessMessage("User deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        refetch();
      } catch (error) {
        setErrorMessage(`Error deleting user: ${error.message}`);
      }
    }
  };

  const UpdateButton = ({ user, isEditing, isLoading }) => {
    if (isEditing) {
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              background: isLoading ? "#ccc" : "#4BB543",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "500"
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner" style={{ 
                  width: "16px", 
                  height: "16px", 
                  border: "2px solid rgba(255,255,255,0.3)", 
                  borderRadius: "50%", 
                  borderTopColor: "white", 
                  display: "inline-block",
                  animation: "spin 1s linear infinite" 
                }}/>
                Saving...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.5 6L9.5 17L4.5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save Changes
              </>
            )}
          </button>
          <button
            onClick={() => setEditingUser(null)}
            disabled={isLoading}
            style={{
              background: "#f3f3f3",
              color: "#333",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              fontWeight: "500"
            }}
          >
            Cancel
          </button>
        </div>
      );
    }
    
    return (
      <button
        onClick={() => handleEdit(user)}
        style={{
          background: "#f3f3f3",
          color: "#333",
          border: "none",
          borderRadius: "4px",
          padding: "8px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: "500"
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Edit
      </button>
    );
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (error) return (
    <div className="error-container">
      <h3 className="error-title">Failed to load users</h3>
      <p className="error-message">{error.message}</p>
      <button onClick={() => refetch()} style={{
        backgroundColor: "#FFD281", color: "#000000", border: "none", borderRadius: "4px",
        padding: "8px 16px", fontWeight: "500", cursor: "pointer", marginTop: "10px"
      }}>Try Again</button>
    </div>
  );
  if (!data?.users?.length) return <div className="empty-state"><p className="empty-text">No users available</p></div>;

  return (
    <div>
      <div className="section-title">Users ({data.users.length})</div>
      {successMessage && (
        <div style={{
          padding: "12px 16px", marginBottom: "16px",
          backgroundColor: "rgba(75, 181, 67, 0.1)", borderRadius: "6px", color: "#4BB543", border: "1px solid #4BB543"
        }}>
          <span style={{ fontWeight: "600" }}>✓</span> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{
          padding: "12px 16px", marginBottom: "16px", backgroundColor: "rgba(213, 32, 41, 0.1)",
          borderRadius: "6px", color: "#D52029", border: "1px solid #D52029", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <span style={{ fontWeight: "600", marginRight: "8px" }}>Error:</span>
            {errorMessage}
          </div>
          <button onClick={() => setErrorMessage("")} style={{
            background: "none", border: "none", color: "#D52029", cursor: "pointer", fontWeight: "bold"
          }}>×</button>
        </div>
      )}
      <div className="table-container" style={{ maxHeight: "500px", overflow: "auto" }}>
        <table className="scrollable-table" style={{ minWidth: "1000px" }}>
          <thead className="table-header">
            <tr>
              {["Name", "Email", "University ID", "Gender", "Phone", "Role", "Email Verification", "Created", "Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #EDEDED' }}>
                <td style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    height: "2.5rem", width: "2.5rem", borderRadius: "50%",
                    background: "linear-gradient(45deg, #FFD281, #FFC44F)", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#000000",
                    fontWeight: "600", textTransform: "uppercase", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      style={{ width: "auto", marginBottom: 0 }}
                    />
                  ) : (
                    <span style={{ fontWeight: "500", color: "#000000" }}>{user.name}</span>
                  )}
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      style={{ width: "auto", marginBottom: 0 }}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={formData.universityId}
                      onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                      className="form-input"
                      style={{ width: "auto", marginBottom: 0 }}
                    />
                  ) : (
                    user.universityId
                  )}
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  {editingUser === user.id ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="form-input"
                      style={{ width: "auto", marginBottom: 0 }}
                      disabled={true} // Gender isn't in the updateUser mutation
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  ) : (
                    user.gender
                  )}
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="form-input"
                      style={{ width: "auto", marginBottom: 0 }}
                    />
                  ) : (
                    user.phoneNumber
                  )}
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  {editingUser === user.id ? (
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="form-input"
                      style={{ width: "auto", marginBottom: 0 }}
                    >
                      <option value="admin">Admin</option>
                      <option value="driver">Driver</option>
                      <option value="student">Student</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        backgroundColor: roleColors[user.role.toLowerCase()]?.bg,
                        color: roleColors[user.role.toLowerCase()]?.text,
                        border: roleColors[user.role.toLowerCase()]?.border,
                        borderRadius: "6px",
                        padding: "2px 10px",
                        fontWeight: 500,
                        fontSize: "0.95rem"
                      }}
                    >
                      {user.role.toLowerCase() === "admin" ? "Admin" : 
                       user.role.toLowerCase() === "driver" ? "Driver" : 
                       "Student"}
                    </span>
                  )}
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  {editingUser === user.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ display: "flex", alignItems: "center", fontSize: "0.8rem" }}>
                        <input
                          type="checkbox"
                          checked={formData.isEmailVerified || false}
                          onChange={(e) => setFormData({ ...formData, isEmailVerified: e.target.checked })}
                          style={{ marginRight: "8px" }}
                        />
                        Email Verified
                      </label>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ 
                        fontSize: "0.8rem", 
                        backgroundColor: user.isEmailVerified ? "rgba(75, 181, 67, 0.1)" : "rgba(213, 32, 41, 0.1)",
                        color: user.isEmailVerified ? "#4BB543" : "#D52029",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        display: "inline-block" 
                      }}>
                        Email: {user.isEmailVerified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  )}
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "1rem 1.5rem" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <UpdateButton 
                      user={user}
                      isEditing={editingUser === user.id}
                      isLoading={updateLoading}
                    />
                    
                    {editingUser !== user.id && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          background: "#D52029",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: "500"
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6h18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default function UserList() {
  return (
    <ApolloProvider client={userClient}>
      <UserListContent />
    </ApolloProvider>
  );
}