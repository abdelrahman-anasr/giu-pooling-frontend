import React, { useState } from "react";
import { useQuery, useMutation, gql, ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import "../../styles/Common.css";

// Create client with the correct endpoint
const complaintsClient = new ApolloClient({
  uri: "http://localhost:4000/graphql", // Use the correct GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
});

const GET_COMPLAINTS = gql`
  query {
    complaints {
      id
      universityId
      Subject
      Message
      createdAt
    }
  }
`;

// Updated to match backend schema - ensuring the ID is properly formatted
const DELETE_COMPLAINT = gql`
  mutation DeleteComplaint($id: ID!) {
    deleteComplaint(id: $id) {
      id
    }
  }
`;

const CREATE_ADMIN_RESPONSE = gql`
  mutation CreateAdminResponse($complaintId: Int!, $Subject: String!, $Message: String!) {
    createAdminResponse(complaintId: $complaintId, Subject: $Subject, Message: $Message) {
      id
      Subject
      Message
      createdAt
      complaintId
    }
  }
`;

const ComplaintsPanelContent = () => {
  const { data, loading, error, refetch } = useQuery(GET_COMPLAINTS);
  const [deleteComplaint, { loading: deleteLoading }] = useMutation(DELETE_COMPLAINT, {
    refetchQueries: [{ query: GET_COMPLAINTS }],
    onError: (error) => {
      console.error("Error deleting complaint:", error);
      setDeleteError(`Failed to delete: ${error.message}`);
      setTimeout(() => setDeleteError(""), 5000);
    }
  });
  
  const [createResponse] = useMutation(CREATE_ADMIN_RESPONSE);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseForm, setResponseForm] = useState({ Subject: "", Message: "" });
  const [responseError, setResponseError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <h3 className="error-title">Failed to load complaints</h3>
      <p className="error-message">{error.message}</p>
    </div>
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        setDeletingId(id);
        // Use ID as a string to ensure compatibility with GraphQL ID type
        await deleteComplaint({ 
          variables: { id: id.toString() }
        });
        // Refetch handled by refetchQueries option
        setDeleteError("");
      } catch (err) {
        // Error handling done in onError callback
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleResponse = async (e) => {
    e.preventDefault();
    setResponseError("");
    
    if (!responseForm.Subject || !responseForm.Message) {
      setResponseError("Subject and message are required");
      return;
    }
    
    try {
      await createResponse({
        variables: {
          complaintId: parseInt(respondingTo.id, 10),
          Subject: responseForm.Subject,
          Message: responseForm.Message,
        },
      });
      setRespondingTo(null);
      setResponseForm({ Subject: "", Message: "" });
      refetch();
    } catch (err) {
      console.error("Error creating response:", err);
      setResponseError(err.message || "Failed to create response. Please try again.");
    }
  };

  return (
    <div style={{ 
      overflow: "hidden", 
      height: "100%", 
      display: "flex",
      flexDirection: "column",
      maxHeight: "100vh",
      position: "relative"
    }}>
      <div style={{ flex: "0 0 auto", marginBottom: "16px" }}>
        <div className="section-title">Complaints</div>
        
        {deleteError && (
          <div style={{ 
            padding: "10px", 
            marginTop: "10px",
            backgroundColor: "rgba(213, 32, 41, 0.1)", 
            borderRadius: "6px", 
            color: "#D52029",
            border: "1px solid #D52029" 
          }}>
            {deleteError}
          </div>
        )}
      </div>
      
      <div style={{ flex: "1 1 auto", position: "relative", minHeight: "300px" }}>
        {!data || !data.complaints || data.complaints.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">No complaints available</p>
          </div>
        ) : (
          <div style={{ 
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: "auto", 
            overflowX: "hidden",
            padding: "10px",
            border: "1px solid #EDEDED",
            borderRadius: "8px",
            backgroundColor: "#FFF8EF"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {data.complaints.map((complaint) => (
                <div 
                  key={complaint.id} 
                  style={{
                    border: "1px solid #000000",
                    borderRadius: "10px",
                    padding: "16px",
                    backgroundColor: "#FFFFFF",
                    marginBottom: "16px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    opacity: deletingId === complaint.id ? 0.6 : 1,
                    transition: "opacity 0.2s ease"
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start"
                    }}>
                    <div>
                        <p style={{ fontSize: "0.875rem", color: "#000000" }}>User ID: {complaint.universityId}</p>
                        <p style={{ fontSize: "0.875rem", color: "#000000" }}>
                        {new Date(complaint.createdAt).toLocaleString()}
                      </p>
                    </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => setRespondingTo(complaint)}
                        style={{ 
                          padding: "4px 12px", 
                          fontSize: "14px",
                          backgroundColor: "#FFD281",
                          color: "#000000",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                        disabled={deleteLoading && deletingId === complaint.id}
                      >
                        Respond
                      </button>
                      <button
                        onClick={() => handleDelete(complaint.id)}
                        style={{ 
                          padding: "4px 12px", 
                          fontSize: "14px",
                          backgroundColor: "#D52029",
                          color: "#FFFFFF",
                          borderRadius: "8px",
                          border: "none",
                          fontWeight: "600",
                          cursor: deleteLoading && deletingId === complaint.id ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        disabled={deleteLoading && deletingId === complaint.id}
                      >
                        {deleteLoading && deletingId === complaint.id ? (
                          <>
                            <span 
                              style={{
                                display: "inline-block",
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                border: "2px solid #FFFFFF",
                                borderTopColor: "transparent",
                                marginRight: "6px",
                                animation: "spin 1s linear infinite"
                              }}
                            />
                            Deleting...
                          </>
                        ) : "Delete"}
                      </button>
                    </div>
                  </div>
                    <h3 style={{ 
                      fontSize: "18px", 
                      fontWeight: "600", 
                      marginTop: "12px",
                      color: "#000000" 
                    }}>
                      {complaint.Subject}
                    </h3>
                  </div>
                  <div style={{ 
                    padding: "12px", 
                    backgroundColor: "#FFF8EF", 
                    borderRadius: "8px", 
                    marginBottom: "12px" 
                  }}>
                    <p style={{ color: "#000000", lineHeight: "1.5" }}>{complaint.Message}</p>

                  {respondingTo?.id === complaint.id && (
                      <div style={{ 
                        marginTop: "1rem", 
                        padding: "1rem", 
                        backgroundColor: "#FFFFFF", 
                        borderRadius: "0.5rem",
                        border: "1px solid #000000"
                      }}>
                      {responseError && (
                        <div style={{ 
                          padding: "10px", 
                          marginBottom: "16px", 
                          backgroundColor: "rgba(213, 32, 41, 0.1)", 
                          borderRadius: "6px", 
                          color: "#D52029" 
                        }}>
                          {responseError}
                        </div>
                      )}
                      <form onSubmit={handleResponse}>
                          <div className="form-group">
                            <label className="form-label">Subject</label>
                          <input
                            type="text"
                            value={responseForm.Subject}
                            onChange={(e) => setResponseForm({ ...responseForm, Subject: e.target.value })}
                              className="form-input"
                            required
                          />
                        </div>
                          <div className="form-group">
                            <label className="form-label">Message</label>
                          <textarea
                            value={responseForm.Message}
                            onChange={(e) => setResponseForm({ ...responseForm, Message: e.target.value })}
                              className="form-input"
                            rows="4"
                            required
                            ></textarea>
                        </div>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => setRespondingTo(null)}
                            style={{ 
                              padding: "8px 16px", 
                              fontSize: "14px",
                              backgroundColor: "#EDEDED",
                              color: "#000000",
                              borderRadius: "8px",
                              border: "1px solid #000000",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            style={{ 
                              padding: "8px 16px", 
                              fontSize: "14px",
                              backgroundColor: "#FFD281",
                              color: "#000000",
                              borderRadius: "8px",
                              border: "none",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Send Response
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

// Wrap the component with ApolloProvider to use custom client
const ComplaintsPanel = () => {
  return (
    <ApolloProvider client={complaintsClient}>
      <ComplaintsPanelContent />
    </ApolloProvider>
  );
};

export default ComplaintsPanel; 