import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql, ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import "../../styles/Common.css";
// Create client with the correct endpoint
const adminClient = new ApolloClient({
  uri: "https://userservice-production-63de.up.railway.app/graphql", // Ensure correct GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
});

// GraphQL queries/mutations
const GET_ADMIN_RESPONSES = gql`
  query {
    adminResponses {
      id
      Subject
      Message
      createdAt
      complaintId
    }
  }
`;

const CREATE_ADMIN_RESPONSE = gql`
  mutation ($complaintId: Int!, $Subject: String!, $Message: String!) {
    createAdminResponse(complaintId: $complaintId, Subject: $Subject, Message: $Message) {
      id
      Subject
      Message
      createdAt
      complaintId
    }
  }
`;

// Custom error types to handle different scenarios
const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

const AdminResponsesContent = () => {
  const { loading, error, data, refetch } = useQuery(GET_ADMIN_RESPONSES, {
    onError: (error) => {
      console.error("Error fetching admin responses:", error);
      const errorType = determineErrorType(error);
      handleError(errorType, error.message, "fetching responses");
    }
  });
  
  const [createResponse, { loading: creating }] = useMutation(CREATE_ADMIN_RESPONSE, {
    onError: (error) => {
      console.error("Error creating response:", error);
      const errorType = determineErrorType(error);
      handleError(errorType, error.message, "creating response");
    }
  });
  
  const [form, setForm] = useState({ complaintId: "", Subject: "", Message: "" });
  const [formErrors, setFormErrors] = useState({
    complaintId: "",
    Subject: "",
    Message: "",
    general: ""
  });
  const [errorAlert, setErrorAlert] = useState({ show: false, type: '', message: '', action: '' });
  const [successMessage, setSuccessMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  
  // Determine the type of error
  const determineErrorType = (error) => {
    if (!error) return ERROR_TYPES.UNKNOWN;
    
    if (error.networkError) return ERROR_TYPES.NETWORK;
    
    if (error.graphQLErrors) {
      for (const gqlError of error.graphQLErrors) {
        if (gqlError.extensions?.code === 'UNAUTHENTICATED' || 
            gqlError.message.includes('Unauthorized') ||
            gqlError.message.includes('not authorized')) {
          return ERROR_TYPES.AUTH;
        }
        
        if (gqlError.extensions?.code === 'BAD_USER_INPUT' ||
            gqlError.message.includes('validation')) {
          return ERROR_TYPES.VALIDATION;
        }
        
        if (gqlError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          return ERROR_TYPES.SERVER;
        }
      }
    }
    
    return ERROR_TYPES.UNKNOWN;
  };
  
  // Handle different error types
  const handleError = (errorType, message, action) => {
    let errorMessage = message;
    
    switch (errorType) {
      case ERROR_TYPES.NETWORK:
        errorMessage = `Network error while ${action}. Please check your connection.`;
        break;
      case ERROR_TYPES.VALIDATION:
        errorMessage = `Validation error: ${message}`;
        break;
      case ERROR_TYPES.AUTH:
        errorMessage = `Authentication error. You might need to log in again.`;
        break;
      case ERROR_TYPES.SERVER:
        errorMessage = `Server error while ${action}. Please try again later.`;
        break;
      default:
        errorMessage = `Error while ${action}: ${message}`;
    }
    
    setErrorAlert({ 
      show: true, 
      type: errorType, 
      message: errorMessage,
      action
    });
    
    // Auto-hide error after 6 seconds
    setTimeout(() => {
      setErrorAlert(prev => ({...prev, show: false}));
    }, 6000);
  };
  
  // Validate form fields
  const validateForm = () => {
    const errors = {
      complaintId: "",
      Subject: "",
      Message: "",
      general: ""
    };
    let isValid = true;
    
    // Complaint ID validation
    if (!form.complaintId.trim()) {
      errors.complaintId = "Complaint ID is required";
      isValid = false;
    } else if (isNaN(form.complaintId) || parseInt(form.complaintId) <= 0) {
      errors.complaintId = "Complaint ID must be a positive number";
      isValid = false;
    }
    
    // Subject validation
    if (!form.Subject.trim()) {
      errors.Subject = "Subject is required";
      isValid = false;
    } else if (form.Subject.trim().length < 3) {
      errors.Subject = "Subject must be at least 3 characters";
      isValid = false;
    } else if (form.Subject.trim().length > 100) {
      errors.Subject = "Subject must be less than 100 characters";
      isValid = false;
    }
    
    // Message validation
    if (!form.Message.trim()) {
      errors.Message = "Message is required";
      isValid = false;
    } else if (form.Message.trim().length < 5) {
      errors.Message = "Message must be at least 5 characters";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear specific field error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({...prev, [name]: ""}));
    }
    
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({ complaintId: "", Subject: "", Message: "", general: "" });
    setSuccessMessage("");
    
    // Validate form
    if (!validateForm()) return;
    
    try {
      await createResponse({ 
        variables: { 
          ...form, 
          complaintId: parseInt(form.complaintId, 10) 
        } 
      });
      
      // Success! Clear form and show success message
      setForm({ complaintId: "", Subject: "", Message: "" });
      setSuccessMessage("Response sent successfully!");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      refetch();
    } catch (error) {
      console.error("Error creating response:", error);
      
      // Add a general form error
      setFormErrors(prev => ({
        ...prev, 
        general: "Failed to create response. Please try again."
      }));
    }
  };
  
  // Auto retry on network errors
  useEffect(() => {
    if (errorAlert.show && errorAlert.type === ERROR_TYPES.NETWORK && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying (${retryCount + 1}/3)...`);
        setRetryCount(prev => prev + 1);
        refetch();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [errorAlert, retryCount, refetch]);
  
  // Reset retry count when data loads successfully
  useEffect(() => {
    if (data) {
      setRetryCount(0);
    }
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "16rem" 
      }}>
        <div style={{
          animation: "spin 1s linear infinite",
          border: "4px solid #EDEDED",
          borderTopColor: "#000000",
          borderRadius: "50%",
          height: "2rem",
          width: "2rem"
        }}></div>
        <p style={{ marginLeft: "12px", color: "#000000" }}>Loading admin responses...</p>
      </div>
    );
  }

  // Error state - but only show for non-recoverable errors
  if (error && determineErrorType(error) !== ERROR_TYPES.NETWORK) {
    return (
      <div style={{ 
        maxWidth: "100%", 
        margin: "1.5rem auto 0", 
        background: "rgba(213, 32, 41, 0.1)", 
        padding: "1.5rem", 
        borderRadius: "0.5rem",
        border: "1px solid #D52029"
      }}>
        <h3 style={{ color: "#D52029", fontWeight: "600", marginBottom: "0.25rem" }}>Failed to load admin responses</h3>
        <p style={{ color: "#D52029", fontSize: "0.875rem", marginBottom: "1rem" }}>{error.message}</p>
        <button 
          onClick={() => refetch()}
          style={{
            backgroundColor: "#FFD281",
            color: "#000000",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            fontWeight: "500",
            cursor: "pointer"
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="data-box" style={{ 
      overflow: "hidden", 
      maxHeight: "100vh",
      position: "relative",
      display: "flex", 
      flexDirection: "column"
    }}>
      <div style={{ flex: "0 0 auto" }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Send Admin Response</div>
        
        {/* Success message */}
        {successMessage && (
          <div style={{ 
            padding: "12px 16px", 
            marginBottom: "16px", 
            backgroundColor: "rgba(75, 181, 67, 0.1)", 
            borderRadius: "6px", 
            color: "#4BB543",
            border: "1px solid #4BB543"
          }}>
            <span style={{ fontWeight: "600" }}>✓</span> {successMessage}
          </div>
        )}
        
        {/* Error alert */}
        {errorAlert.show && (
          <div style={{ 
            padding: "12px 16px", 
            marginBottom: "16px", 
            backgroundColor: "rgba(213, 32, 41, 0.1)", 
            borderRadius: "6px", 
            color: "#D52029",
            border: "1px solid #D52029",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <span style={{ fontWeight: "600", marginRight: "8px" }}>Error:</span> 
              {errorAlert.message}
            </div>
            <button 
              onClick={() => setErrorAlert(prev => ({...prev, show: false}))}
              style={{
                background: "none",
                border: "none",
                color: "#D52029",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              ×
            </button>
          </div>
        )}
        
        {/* Form general error */}
        {formErrors.general && (
          <div style={{ 
            padding: "12px 16px", 
            marginBottom: "16px", 
            backgroundColor: "rgba(213, 32, 41, 0.1)", 
            borderRadius: "6px", 
            color: "#D52029",
            border: "1px solid #D52029"
          }}>
            {formErrors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "24px", marginBottom: "18px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "180px", maxWidth: "100%" }}>
              <label htmlFor="complaintId" style={{ display: "block", fontWeight: "500", marginBottom: "6px", color: "#000000" }}>
                Complaint ID
              </label>
              <input
                type="number"
                id="complaintId"
                name="complaintId"
                value={form.complaintId}
                onChange={handleChange}
                placeholder="Enter complaint ID"
                style={{
                  background: "#FFFFFF",
                  border: formErrors.complaintId ? "2px solid #D52029" : "2px solid #000000",
                  borderRadius: "6px",
                  padding: "12px 10px",
                  fontSize: "16px",
                  marginBottom: formErrors.complaintId ? "4px" : "18px",
                  width: "100%",
                  maxWidth: "400px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  outline: "none"
                }}
              />
              {formErrors.complaintId && (
                <p style={{ 
                  color: "#D52029", 
                  fontSize: "0.75rem", 
                  margin: "0 0 8px 0"
                }}>
                  {formErrors.complaintId}
                </p>
              )}
            </div>
            <div style={{ flex: 1, minWidth: "180px", maxWidth: "100%" }}>
              <label htmlFor="Subject" style={{ display: "block", fontWeight: "500", marginBottom: "6px", color: "#000000" }}>
                Subject
              </label>
              <input
                type="text"
                id="Subject"
                name="Subject"
                value={form.Subject}
                onChange={handleChange}
                placeholder="Enter subject"
                style={{
                  background: "#FFFFFF",
                  border: formErrors.Subject ? "2px solid #D52029" : "2px solid #000000",
                  borderRadius: "6px",
                  padding: "12px 10px",
                  fontSize: "16px",
                  marginBottom: formErrors.Subject ? "4px" : "18px",
                  width: "100%",
                  maxWidth: "400px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  outline: "none"
                }}
              />
              {formErrors.Subject && (
                <p style={{ 
                  color: "#D52029", 
                  fontSize: "0.75rem", 
                  margin: "0 0 8px 0"
                }}>
                  {formErrors.Subject}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="Message" style={{ display: "block", fontWeight: "500", marginBottom: "6px", color: "#000000" }}>
              Message
            </label>
            <textarea
              id="Message"
              name="Message"
              value={form.Message}
              onChange={handleChange}
              placeholder="Enter your message"
              rows={4}
              style={{
                width: "100%",
                maxWidth: "100%",
                marginBottom: formErrors.Message ? "4px" : "18px",
                borderRadius: "6px",
                border: formErrors.Message ? "2px solid #D52029" : "2px solid #000000",
                padding: "12px 10px",
                fontSize: "16px",
                fontFamily: "inherit",
                outline: "none",
                background: "#FFFFFF",
                resize: "vertical"
              }}
            />
            {formErrors.Message && (
              <p style={{ 
                color: "#D52029", 
                fontSize: "0.75rem", 
                margin: "0 0 8px 0"
              }}>
                {formErrors.Message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={creating}
            style={{
              borderRadius: "8px",
              fontWeight: "700",
              border: "none",
              padding: "12px 32px",
              fontSize: "17px",
              backgroundColor: "#FFD281",
              color: "#000000",
              cursor: creating ? "not-allowed" : "pointer",
              marginBottom: "8px",
              marginTop: "10px",
              opacity: creating ? 0.7 : 1,
              display: "flex",
              alignItems: "center"
            }}
          >
            {creating && (
              <span 
                style={{
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid #000000",
                  borderTopColor: "transparent",
                  marginRight: "8px",
                  animation: "spin 1s linear infinite"
                }}
              />
            )}
            {creating ? "Sending..." : "Send Response"}
          </button>
        </form>

        <hr style={{ border: "none", borderTop: "2px solid #000000", margin: "24px 0" }} />

        <div className="section-title" style={{ marginBottom: 16, fontSize: "1.5rem", fontWeight: "700", color: "#000000" }}>Admin Responses</div>
      </div>
      
      {/* This is the only part that should be scrollable */}
      <div style={{ flex: "1 1 auto", position: "relative", minHeight: "300px" }}>
        {!data || !data.adminResponses || data.adminResponses.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem 0", 
            color: "#000000", 
            border: "1px dashed #EDEDED",
            borderRadius: "8px",
            backgroundColor: "#FFF8EF",
            height: "100%"
          }}>
            <p style={{ fontSize: "1rem" }}>No admin responses available</p>
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
            padding: "16px",
            border: "1px solid #EDEDED",
            borderRadius: "10px",
            backgroundColor: "#FFF8EF",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {data.adminResponses.map((resp) => (
                <div 
                  key={resp.id} 
                  style={{
                    border: "2px solid #000000",
                    borderRadius: "10px",
                    padding: "16px",
                    backgroundColor: "#FFFFFF",
                    marginBottom: "4px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "default"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                  }}
                >
                  <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{ fontWeight: "600", color: "#000000" }}>Complaint ID: </span>
                      <span style={{ color: "#000000" }}>{resp.complaintId} | </span>
                      <span style={{ fontWeight: "600", color: "#000000" }}>{resp.Subject}</span>
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#666", 
                      backgroundColor: "#EDEDED", 
                      padding: "4px 8px", 
                      borderRadius: "4px" 
                    }}>
                      ID: {resp.id}
                    </div>
                  </div>
                  <div style={{ fontSize: "14px", color: "#000000", marginBottom: "12px" }}>
                    {new Date(resp.createdAt).toLocaleString()}
                  </div>
                  <div style={{ 
                    padding: "12px", 
                    backgroundColor: "#FFF8EF", 
                    borderRadius: "8px", 
                    color: "#000000",
                    border: "1px solid #000000",
                    lineHeight: "1.5"
                  }}>
                    {resp.Message}
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
const AdminResponses = () => {
  return (
    <ApolloProvider client={adminClient}>
      <AdminResponsesContent />
    </ApolloProvider>
  );
};

export default AdminResponses;
