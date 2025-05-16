import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import "../../styles/Common.css";
// GraphQL queries and mutations
const GET_REQUESTS = gql`
  query {
    requests {
      id
      universityId
      status
      createdAt
      reviewedAt
      licenseURL
    }
  }
`;

const ACCEPT_REQUEST = gql`
  mutation AcceptRequest($id: ID!) {
    acceptRequest(id: $id) {
      id
      DriverId
      carModel
      carModelYear
      seats
    }
  }
`;

const REJECT_REQUEST = gql`
  query RejectRequest($id: ID!) {
    rejectRequest(id: $id) {
      id
      status
    }
  }
`;

// Utility function for consistent error logging
const logError = (error) => {
  console.error("Request operation error:", error);
  
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach(err => {
      console.error("GraphQL error:", err.message, err.path);
    });
  }
  
  if (error.networkError) {
    console.error("Network error:", error.networkError);
  }
};

const RequestManager = () => {
  // Query and mutations setup
  const { data, loading, error, refetch, client } = useQuery(GET_REQUESTS);
  
  // State management
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [updatedStatuses, setUpdatedStatuses] = useState({});
  const [rejectStatusLoading, setRejectStatusLoading] = useState(false);

  // Accept request mutation
  const [acceptRequest, { loading: acceptLoading }] = useMutation(ACCEPT_REQUEST, {
    onCompleted: (data) => {
      setSuccessMessage("Driver request accepted successfully!");
      setUpdatedStatuses(prev => ({
        ...prev,
        [processingId]: "APPROVED"
      }));
      setTimeout(() => refetch(), 300);
      setProcessingId(null);
    },
    onError: (error) => {
      logError(error);
      setErrorMessage(error.graphQLErrors?.[0]?.message || "Failed to accept the request");
      setProcessingId(null);
    },
    // Add fetchPolicy to ensure we're not using cached results
    fetchPolicy: "no-cache",
    refetchQueries: [{ query: GET_REQUESTS }]
  });

  // Handler for reject button
  const handleReject = async (id) => {
    try {
      // Reset messages and set processing state
      setProcessingId(id);
      setRejectStatusLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Make a direct query to reject the request
      const { data } = await client.query({
        query: REJECT_REQUEST,
        variables: { id },
        fetchPolicy: "no-cache"
      });
      
      if (data && data.rejectRequest) {
        // Update the UI after successful rejection
        setSuccessMessage("Driver request rejected successfully!");
        setUpdatedStatuses(prev => ({
          ...prev,
          [id]: "REJECTED"
        }));
      
        // Refetch the main query to update the list
        setTimeout(() => refetch(), 300);
      }
    } catch (error) {
      logError(error);
      setErrorMessage(error.graphQLErrors?.[0]?.message || "Failed to reject the request");
    } finally {
      setRejectStatusLoading(false);
      setProcessingId(null);
    }
  };

  // Handler for accept button
  const handleAccept = async (id) => {
    try {
      setProcessingId(id);
      setErrorMessage("");
      setSuccessMessage("");
      
      await acceptRequest({ 
        variables: { id }
      });
      
      // Success handling is in onCompleted callback
    } catch (error) {
      console.error("Unexpected error during accept:", error);
      setErrorMessage(`An unexpected error occurred: ${error.message}`);
      setProcessingId(null);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? "Date unavailable" 
        : date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (e) {
      return "Date unavailable";
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "PENDING":
        return <span className="status-badge pending">Pending</span>;
      case "APPROVED":
        return <span className="status-badge approved">Approved</span>;
      case "REJECTED":
        return <span className="status-badge rejected">Rejected</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  // Get effective status (local state or server data)
  const getEffectiveStatus = (req) => {
    return updatedStatuses[req.id] || req.status;
  };

  // Clear messages
  const clearSuccessMessage = () => setSuccessMessage("");
  const clearErrorMessage = () => setErrorMessage("");

  // Render component
  return (
    <div className="data-box">
      <div className="section-title" style={{ marginBottom: 16 }}>Driver Requests</div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="success-message" style={{ 
          backgroundColor: "#FFD281", 
          color: "#000000", 
          padding: "10px 15px", 
          borderRadius: "8px", 
          marginBottom: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>✓ {successMessage}</span>
          <button onClick={clearSuccessMessage} style={{
            background: "transparent",
            border: "none",
            color: "#000000",
            fontSize: "18px",
            cursor: "pointer",
            padding: "0 5px",
            margin: 0
          }}>×</button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="error-message" style={{ 
          backgroundColor: "rgba(213, 32, 41, 0.1)", 
          color: "#D52029",
          padding: "10px 15px", 
          borderRadius: "8px", 
          marginBottom: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>⚠️ {errorMessage}</span>
          <button onClick={clearErrorMessage} style={{
            background: "transparent",
            border: "none",
            color: "#D52029",
            fontSize: "18px",
            cursor: "pointer",
            padding: "0 5px",
            margin: 0
          }}>×</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading driver requests...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>Error loading requests: {error.message}</p>
          <button className="btn black" onClick={() => refetch()}>Try Again</button>
        </div>
      ) : !data || !data.requests || data.requests.length === 0 ? (
        <div className="empty-state">
          <p style={{ textAlign: "center", color: "#000000", padding: "40px 0" }}>No driver requests found.</p>
        </div>
      ) : (
        <div className="requests-container" style={{ maxHeight: "600px", overflowY: "auto" }}>
          {data.requests.map((req) => {
            const effectiveStatus = getEffectiveStatus(req);
            const isPending = effectiveStatus === "PENDING";
            const isProcessing = processingId === req.id;
            
            return (
              <div key={req.id} className="request-card" style={{
                border: "1px solid #000000",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "16px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}>
                <div className="request-header" style={{
                  marginBottom: "16px",
                  borderBottom: "1px solid #EDEDED",
                  paddingBottom: "12px"
                }}>
                  <h3 style={{ 
                    fontSize: "18px", 
                    fontWeight: "600", 
                    margin: "0 0 4px 0",
                    color: "#000000"
                  }}>
                    Request #{req.id.substring(0, 8)}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>{getStatusBadge(effectiveStatus)}</div>
                    <small style={{ color: "#000000" }}>Created: {formatDate(req.createdAt)}</small>
                  </div>
                </div>

                <div className="request-details" style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "20px"
                }}>
                  <div>
                    <div className="detail-item">
                      <span className="detail-label">University ID:</span>
                      <span className="detail-value">{req.universityId}</span>
                    </div>
                    
                    {req.reviewedAt && (
                      <div className="detail-item">
                        <span className="detail-label">Reviewed:</span>
                        <span className="detail-value">{formatDate(req.reviewedAt)}</span>
                      </div>
                    )}
                </div>
                
                  <div>
                {/* License Section */}
                {req.licenseURL && (
                      <div className="detail-item">
                        <span className="detail-label">License:</span>
                        <div className="detail-value">
                      <button 
                        onClick={() => {
                          const url = req.licenseURL.startsWith('http') 
                            ? req.licenseURL 
                            : `http://localhost:4000${req.licenseURL}`;
                          
                          const newWindow = window.open('', '_blank');
                          newWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>License View</title>
                                <style>
                                      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; background-color: #FFF8EF; }
                                  img { max-width: 90%; max-height: 80vh; object-fit: contain; }
                                      .error { color: #D52029; margin-top: 20px; }
                                      .back-btn { margin-top: 20px; padding: 8px 16px; cursor: pointer; background-color: #000000; color: #FFFFFF; border: none; border-radius: 4px; }
                                </style>
                              </head>
                              <body>
                                <h2>License Document</h2>
                                <img 
                                  src="${url}" 
                                  alt="License Document" 
                                  onerror="this.style.display='none'; document.getElementById('error-msg').style.display='block';"
                                />
                                <div id="error-msg" style="display:none;" class="error">
                                  <p>Unable to load the license image. The file may be missing or in an unsupported format.</p>
                                  <p>URL attempted: ${url}</p>
                                </div>
                                <div>
                                  <button class="back-btn" onclick="window.close()">Close</button>
                                </div>
                              </body>
                            </html>
                          `);
                          newWindow.document.close();
                        }} 
                            className="btn-link"
                      >
                            View License Document
                      </button>
                    </div>
                  </div>
                )}
                  </div>
                </div>

                {/* Action Buttons for Pending Requests */}
                {isPending && (
                  <div className="request-actions" style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                    marginTop: "12px"
                  }}>
                    {/* Accept Button */}
                    <button 
                      className="btn-accept" 
                      onClick={() => handleAccept(req.id)}
                      disabled={isProcessing || acceptLoading || rejectStatusLoading}
                    >
                      {isProcessing && acceptLoading ? (
                        <>
                          <span className="spinner-small"></span>
                          <span>Processing...</span>
                        </>
                      ) : "Accept"}
                    </button>
                    
                    {/* Reject Button */}
                    <button 
                      className="btn-reject" 
                      onClick={() => handleReject(req.id)}
                      disabled={isProcessing || acceptLoading || rejectStatusLoading}
                    >
                      {isProcessing && rejectStatusLoading ? (
                        <>
                          <span className="spinner-small"></span>
                          <span>Processing...</span>
                        </>
                      ) : "Reject"}
                    </button>
                  </div>
                )}
                
                {/* Status Information for Non-Pending Requests */}
                {!isPending && (
                  <div className="status-info" style={{ 
                    marginTop: "12px", 
                    padding: "12px", 
                    backgroundColor: effectiveStatus === "APPROVED" ? "rgba(255, 210, 129, 0.2)" : "rgba(213, 32, 41, 0.1)",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}>
                    <p style={{ margin: 0, color: "#000000" }}>
                      This request has been {effectiveStatus.toLowerCase()}. No further action is required.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>
        {`
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-badge.pending {
          background-color: #EDEDED;
          color: #000000;
        }
        .status-badge.approved {
          background-color: #FFD281;
          color: #000000;
        }
        .status-badge.rejected {
          background-color: #D52029;
          color: #FFFFFF;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
        }
        .loading-spinner {
          border: 4px solid #EDEDED;
          border-top: 4px solid #000000;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        .spinner-small {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #FFFFFF;
          animation: spin 1s ease-in-out infinite;
          vertical-align: middle;
          margin-right: 6px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .requests-container {
          scrollbar-width: thin;
          scrollbar-color: #EDEDED transparent;
        }
        .requests-container::-webkit-scrollbar {
          width: 8px;
        }
        .requests-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .requests-container::-webkit-scrollbar-thumb {
          background-color: #EDEDED;
          border-radius: 4px;
        }

        .detail-item {
          margin-bottom: 8px;
          display: flex;
          flex-direction: column;
        }
        .detail-label {
          font-size: 13px;
          color: #000000;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .detail-value {
          font-size: 15px;
          color: #000000;
        }
        
        .btn-link {
          background: none;
          border: none;
          color: #000000;
          padding: 0;
          font: inherit;
          cursor: pointer;
          text-decoration: underline;
        }
        
        .btn-accept {
          background-color: #FFD281;
          color: #000000;
          border: none;
          border-radius: 25px;
          padding: 10px 24px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        
        .btn-reject {
          background-color: #D52029;
          color: #FFFFFF;
          border: none;
          border-radius: 25px;
          padding: 10px 24px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        
        .btn-accept:hover, .btn-reject:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .btn-accept:active, .btn-reject:active {
          transform: translateY(0);
        }
        
        .btn-accept:disabled, .btn-reject:disabled {
          background-color: #EDEDED;
          color: #000000;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn {
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .btn:active {
          transform: translateY(0);
        }
        .btn.green {
          background-color: #FFD281;
          color: #000000;
        }
        .btn.red {
          background-color: #D52029;
          color: #FFFFFF;
        }
        .btn.blue, .btn.black {
          background-color: #000000;
          color: #FFFFFF;
        }
        .btn.white {
          background-color: #FFFFFF;
          border: 1px solid #000000;
          color: #000000;
        }
        .btn:disabled {
          background-color: #EDEDED;
          color: #000000;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        `}
      </style>
    </div>
  );
};

export default RequestManager;