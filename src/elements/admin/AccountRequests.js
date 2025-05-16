/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, gql, useApolloClient } from "@apollo/client";
import "../../styles/Common.css";

// Color palette
const COLORS = {
  primary: "#FFD281",
  secondary: "#D52029",
  light: "#EDEDED",
  background: "#FFF8EF",
  black: "#000000",
  white: "#FFFFFF"
};

// GraphQL operations - fixed to match backend schema
const GET_ACCOUNT_REQUESTS = gql`
  query {
    accountRequests {
      id
      name
      email
      universityId
      gender
      phoneNumber
      createdAt
    }
  }
`;

// Query to get all users to check for approved requests
const GET_USERS = gql`
  query {
    users {
      id
      universityId
      email
    }
  }
`;

const ACCEPT_ACCOUNT_REQUEST = gql`
  mutation AcceptAccountRequest($id: Int!) {
    acceptAccountRequest(id: $id) {
      id
    }
  }
`;

// This is a query operation in the backend, not a mutation
const REJECT_ACCOUNT_REQUEST = gql`
  query RejectAccountRequest($id: Int!) {
    rejectAccountRequest(id: $id) {
      id
    }
  }
`;

const AccountRequests = () => {
  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_ACCOUNT_REQUESTS, {
    fetchPolicy: 'network-only'
  });
  
  // Query to get all users to compare with requests
  const { data: userData } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only'
  });
  
  const [acceptRequest] = useMutation(ACCEPT_ACCOUNT_REQUEST);
  const apolloClient = useApolloClient();
  
  // Component state
  const [requests, setRequests] = useState([]);
  const [actionInProgress, setActionInProgress] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  
  // Track processed requests for UI display purposes
  const [processedRequests, setProcessedRequests] = useState();
  
  // Get all user emails and university IDs for detecting approved requests
  useEffect(() => {
    if (userData?.users && userData.users.length > 0) {
      // Create maps for quick lookups
      const emailsMap = new Map();
      const universityIdsMap = new Map();
      
      userData.users.forEach(user => {
        if (user.email) emailsMap.set(user.email.toLowerCase(), true);
        if (user.universityId) universityIdsMap.set(user.universityId.toString(), true);
      });
      
      // Update processed requests based on existing users
      if (data?.accountRequests) {
        const updatedProcessed = { ...processedRequests };
        
        data.accountRequests.forEach(request => {
          // If this request's email or universityId exists in users, it was approved
          if (
            (request.email && emailsMap.has(request.email.toLowerCase())) || 
            (request.universityId && universityIdsMap.has(request.universityId.toString()))
          ) {
            updatedProcessed[request.id] = 'APPROVED';
          }
        });
      }
    }
  }, [userData, data, processedRequests]);
  
  // Update requests when data changes
  useEffect(() => {
    if (data?.accountRequests) {
      const sortedRequests = [...data.accountRequests].sort((a, b) => 
        parseInt(b.createdAt) - parseInt(a.createdAt)
      );
      
      setRequests(sortedRequests);
      
      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCount = sortedRequests.filter(req => {
        const reqDate = new Date(parseInt(req.createdAt));
        reqDate.setHours(0, 0, 0, 0);
        return reqDate.getTime() === today.getTime();
      }).length;
      
      setStats({
        total: sortedRequests.length,
        today: todayCount
      });
    }
  }, [data]);
  
  // Helper to show toast notifications
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };
  
  // Handle request acceptance
  const handleAccept = async (id) => {
    setActionInProgress(prev => ({ ...prev, [id]: 'accepting' }));
    
    try {
      await acceptRequest({
        variables: { id: parseInt(id) },
        refetchQueries: [{ query: GET_ACCOUNT_REQUESTS }, { query: GET_USERS }]
      });
      
      // Track this request as processed for UI purposes
      setProcessedRequests(prev => ({
        ...prev,
        [id]: 'APPROVED'
      }));
      
      showToast("Account request accepted successfully");
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => ({ ...prev, _uiStatus: 'APPROVED' }));
      }
      
      refetch();
    } catch (error) {
      console.error("Error accepting request:", error);
      showToast("Failed to accept request: " + error.message, "error");
    } finally {
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };
  
  // Handle request rejection using a query instead of mutation
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this account request?")) {
      return;
    }
    
    setActionInProgress(prev => ({ ...prev, [id]: 'rejecting' }));
    
    try {
      // Execute the rejection query
      await apolloClient.query({
        query: REJECT_ACCOUNT_REQUEST,
        variables: { id: parseInt(id) },
        fetchPolicy: 'network-only'
      });
      
      // Track this request as processed for UI purposes
      setProcessedRequests(prev => ({
        ...prev,
        [id]: 'REJECTED'
      }));
      
      showToast("Account request rejected");
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => ({ ...prev, _uiStatus: 'REJECTED' }));
      }
      
      // Ensure we get fresh data
      refetch();
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast("Failed to reject request: " + error.message, "error");
      refetch();
    } finally {
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };
  
  // View a specific request's details
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    
    // Check if it's today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const requestDate = new Date(date);
    requestDate.setHours(0, 0, 0, 0);
    
    if (requestDate.getTime() === today.getTime()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (requestDate.getTime() === yesterday.getTime()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  // Get status styling
  const getStatusStyles = (requestId) => {
    // If we've processed this request, use that status
    if (processedRequests[requestId]) {
      const status = processedRequests[requestId];
      
      switch(status) {
        case 'APPROVED':
          return {
            bg: '#e6f7f1',
            color: '#06D6A0',
            text: 'Approved'
          };
        case 'REJECTED':
          return {
            bg: '#fbecec',
            color: COLORS.secondary,
            text: 'Rejected'
          };
        default:
          break;
      }
    }
    
    // If this request is being processed, show that status
    if (actionInProgress[requestId]) {
      return {
        bg: '#fff5e6',
        color: '#ffa726',
        text: actionInProgress[requestId] === 'accepting' ? 'Accepting...' : 'Rejecting...'
      };
    }
    
    // Default pending
    return {
      bg: '#fff5e6',
      color: '#ffa726',
      text: 'Pending'
    };
  };
  
  // Check if request has been processed
  const isRequestProcessed = (requestId) => {
    return !!processedRequests[requestId];
  };

  // Render toast notifications
  const renderToasts = () => (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            padding: '12px 20px',
            backgroundColor: toast.type === 'success' ? '#06D6A0' : COLORS.secondary,
            color: COLORS.white,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'fade-in-up 0.3s ease forwards',
            marginTop: '12px',
            maxWidth: '300px'
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
  
  // Component for the empty state
  const EmptyState = () => (
    <div className="empty-state" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      backgroundColor: COLORS.background,
      borderRadius: '12px',
      marginTop: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        backgroundColor: COLORS.primary,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={COLORS.black} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: COLORS.black }}>All Caught Up!</h3>
      <p style={{ color: '#666', maxWidth: '400px' }}>
        There are no pending account requests to review at the moment.
      </p>
      <button 
        onClick={() => refetch()}
        style={{
          marginTop: '24px',
          backgroundColor: COLORS.primary,
          color: COLORS.black,
          border: 'none',
          padding: '10px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        Refresh
      </button>
    </div>
  );
  
  // Loading state component
  const LoadingState = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '48px 0'
    }}>
      <div className="loading-spinner" style={{
        width: '40px',
        height: '40px',
        border: `3px solid ${COLORS.primary}40`,
        borderRadius: '50%',
        borderTop: `3px solid ${COLORS.primary}`,
        animation: 'spin 1s linear infinite'
      }}></div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
  
  // Error state component
  const ErrorState = () => (
    <div style={{
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: 'rgba(213, 32, 41, 0.1)',
      border: `1px solid ${COLORS.secondary}`,
      marginTop: '24px'
    }}>
      <h3 style={{ color: COLORS.secondary, marginTop: 0 }}>
        Failed to load account requests
      </h3>
      <p>{error?.message || 'An unknown error occurred'}</p>
      <button
        onClick={() => refetch()}
        style={{
          backgroundColor: COLORS.secondary,
          color: COLORS.white,
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    </div>
  );
  
  // Request list component
  const RequestList = () => (
    <div className="request-list" style={{
      marginTop: '24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px',
      maxHeight: selectedRequest ? '200px' : '600px',
      overflowY: 'auto',
      transition: 'max-height 0.3s ease'
    }}>
      {requests.map(request => {
        const statusObj = getStatusStyles(request.id);
        const shouldDisableButtons = isRequestProcessed(request.id) || !!actionInProgress[request.id];
        
        return (
          <div
            key={request.id}
            className={`request-card ${selectedRequest?.id === request.id ? 'selected' : ''}`}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              border: selectedRequest?.id === request.id ? `2px solid ${COLORS.primary}` : '1px solid #eee',
              transition: 'all 0.2s ease',
              opacity: actionInProgress[request.id] ? 0.7 : 1,
              transform: actionInProgress[request.id] ? 'scale(0.98)' : 'scale(1)'
            }}
            onClick={() => viewRequestDetails(request)}
          >
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: COLORS.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginRight: '12px',
                  color: COLORS.black
                }}>
                  {request.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: COLORS.black }}>{request.name}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div style={{
                padding: '5px 10px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: statusObj.bg,
                color: statusObj.color
              }}>
                {statusObj.text}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                <strong style={{ color: '#666', marginRight: '8px' }}>Email:</strong>
                {request.email}
              </div>
              <div style={{ fontSize: '14px' }}>
                <strong style={{ color: '#666', marginRight: '8px' }}>ID:</strong>
                {request.universityId}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginTop: '12px'
            }}>
              {!isRequestProcessed(request.id) && (
                <>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleReject(request.id);
                    }}
                    disabled={shouldDisableButtons}
                    style={{
                      backgroundColor: actionInProgress[request.id] === 'rejecting' ? '#ccc' : COLORS.white,
                      color: COLORS.secondary,
                      border: `1px solid ${COLORS.secondary}`,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: shouldDisableButtons ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: shouldDisableButtons ? 0.6 : 1
                    }}
                  >
                    {actionInProgress[request.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleAccept(request.id);
                    }}
                    disabled={shouldDisableButtons}
                    style={{
                      backgroundColor: actionInProgress[request.id] === 'accepting' ? '#ccc' : COLORS.secondary,
                      color: COLORS.white,
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: shouldDisableButtons ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      opacity: shouldDisableButtons ? 0.6 : 1
                    }}
                  >
                    {actionInProgress[request.id] === 'accepting' ? 'Accepting...' : 'Accept'}
                  </button>
                </>
              )}
              {isRequestProcessed(request.id) && (
                <div style={{ 
                  fontSize: '14px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  Request {processedRequests[request.id].toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Detailed view of a selected request
  const RequestDetail = () => {
    if (!selectedRequest) return null;
    
    const statusObj = getStatusStyles(selectedRequest.id);
    const shouldDisableButtons = isRequestProcessed(selectedRequest.id) || !!actionInProgress[selectedRequest.id];
    
    return (
      <div className="request-detail" style={{
        marginTop: '24px',
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        animation: 'fade-in-up 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: COLORS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '600',
              marginRight: '16px',
              color: COLORS.black
            }}>
              {selectedRequest.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h2 style={{ margin: 0, color: COLORS.black }}>{selectedRequest.name}</h2>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '99px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: statusObj.bg,
                  color: statusObj.color
                }}>
                  {statusObj.text}
                </div>
              </div>
              <p style={{ margin: 0, color: '#666' }}>
                Request submitted {formatDate(selectedRequest.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedRequest(null)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          backgroundColor: COLORS.background,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>Email Address</p>
            <p style={{ margin: 0, fontWeight: '500', color: COLORS.black }}>{selectedRequest.email}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>University ID</p>
            <p style={{ margin: 0, fontWeight: '500', color: COLORS.black }}>{selectedRequest.universityId}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>Gender</p>
            <p style={{ margin: 0, fontWeight: '500', textTransform: 'capitalize', color: COLORS.black }}>{selectedRequest.gender}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>Phone Number</p>
            <p style={{ margin: 0, fontWeight: '500', color: COLORS.black }}>{selectedRequest.phoneNumber || 'Not provided'}</p>
          </div>
        </div>
        
        {!isRequestProcessed(selectedRequest.id) && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px'
          }}>
            <button
              onClick={() => handleReject(selectedRequest.id)}
              disabled={shouldDisableButtons}
              style={{
                backgroundColor: COLORS.white,
                color: COLORS.secondary,
                border: `1px solid ${COLORS.secondary}`,
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: shouldDisableButtons ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                opacity: shouldDisableButtons ? 0.6 : 1
              }}
            >
              {actionInProgress[selectedRequest.id] === 'rejecting' ? 'Rejecting...' : 'Reject Request'}
            </button>
            <button
              onClick={() => handleAccept(selectedRequest.id)}
              disabled={shouldDisableButtons}
              style={{
                backgroundColor: COLORS.secondary,
                color: COLORS.white,
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: shouldDisableButtons ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                opacity: shouldDisableButtons ? 0.6 : 1
              }}
            >
              {actionInProgress[selectedRequest.id] === 'accepting' ? 'Accepting...' : 'Accept Request'}
            </button>
          </div>
        )}
        {isRequestProcessed(selectedRequest.id) && (
          <div style={{ 
            textAlign: 'center',
            padding: '16px',
            backgroundColor: statusObj.bg,
            borderRadius: '8px',
            color: statusObj.color,
            fontWeight: '500'
          }}>
            This request has been {processedRequests[selectedRequest.id].toLowerCase()}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="account-requests-container">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: COLORS.black }}>Account Requests</h1>
          <p style={{ margin: 0, color: '#666' }}>
            Manage pending requests for new user accounts
          </p>
        </div>
        
        {!loading && !error && requests.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: COLORS.background,
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Today</span>
              <span style={{ fontWeight: '600', color: COLORS.secondary }}>{stats.today}</span>
            </div>
            <div style={{
              backgroundColor: COLORS.background,
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Total</span>
              <span style={{ fontWeight: '600', color: COLORS.secondary }}>{stats.total}</span>
            </div>
            <button
              onClick={() => refetch()}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: COLORS.black
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Refresh
            </button>
          </div>
        )}
      </div>
      
      {/* Main content */}
      {loading && !requests.length ? <LoadingState /> : null}
      {error ? <ErrorState /> : null}
      {!loading && !error && !requests.length ? <EmptyState /> : null}
      {!loading && !error && requests.length > 0 ? <RequestList /> : null}
      {selectedRequest && <RequestDetail />}
      
      {/* Toasts */}
      {renderToasts()}
    </div>
  );
};

export default AccountRequests;