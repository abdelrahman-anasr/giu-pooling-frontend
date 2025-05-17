/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, gql, useApolloClient } from "@apollo/client";
import "../../styles/Common.css";
import "../../styles/AccountRequests.css";

// GraphQL operations
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
      email
      role
      name
      universityId
    }
  }
`;

const REJECT_ACCOUNT_REQUEST = gql`
  query RejectAccountRequest($id: Int!) {
    rejectAccountRequest(id: $id) {
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

const AccountRequests = () => {
  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_ACCOUNT_REQUESTS, {
    fetchPolicy: 'network-only'
  });
  
  const { data: userData } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only'
  });
  
  const [acceptRequest] = useMutation(ACCEPT_ACCOUNT_REQUEST);
  const apolloClient = useApolloClient();
  
  // Component state
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processedRequests, setProcessedRequests] = useState({});
  const [actionInProgress, setActionInProgress] = useState({});
  const [toasts, setToasts] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refs for scrolling and focus management
  const requestListRef = useRef(null);
  const selectedCardRef = useRef(null);
  const mainContentRef = useRef(null);
  
  // Effect to scroll selected item into view
  useEffect(() => {
    if (selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
      selectedCardRef.current.focus();
    }
  }, [selectedRequest]);
  
  // Effect to sort and process requests data
  useEffect(() => {
    if (data?.accountRequests) {
      console.log('Account requests from server:', data.accountRequests);
      
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
  
  // Effect to identify already processed requests by checking users data
  useEffect(() => {
    if (userData?.users && userData.users.length > 0 && data?.accountRequests) {
      console.log('Processing users:', userData.users.length);
      console.log('Processing account requests:', data.accountRequests.length);
      
      const emailsMap = new Map();
      const universityIdsMap = new Map();
      
      userData.users.forEach(user => {
        if (user.email) emailsMap.set(user.email.toLowerCase(), true);
        if (user.universityId) universityIdsMap.set(user.universityId.toString(), true);
      });
      
      const updatedProcessed = { ...processedRequests };
      let changed = false;
      
      data.accountRequests.forEach(request => {
        // Check if a user exists with this email or universityId
        // If so, this request has been approved
        if (
          (request.email && emailsMap.has(request.email.toLowerCase())) || 
          (request.universityId && universityIdsMap.has(request.universityId.toString()))
        ) {
          if (updatedProcessed[request.id] !== 'APPROVED') {
            updatedProcessed[request.id] = 'APPROVED';
            changed = true;
          }
        }
      });
      
      if (changed) {
        setProcessedRequests(updatedProcessed);
      }
    }
  }, [userData, data, processedRequests]);
  
  // Effect to update selectedRequest if its data changes in the main requests array
  useEffect(() => {
    if (selectedRequest && requests.length > 0) {
      const updatedRequestData = requests.find(req => req.id === selectedRequest.id);
      if (updatedRequestData) {
        setSelectedRequest({...updatedRequestData, _uiStatus: selectedRequest._uiStatus});
      }
    }
  }, [requests, selectedRequest]);
  
  // Utility functions
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };
  
  // Update the clearCacheAndRefetch function to be more aggressive
  const clearCacheAndRefetch = async () => {
    try {
      // Clear all relevant queries from cache
      console.log('Clearing Apollo cache...');
      apolloClient.cache.evict({ fieldName: 'accountRequests' });
      apolloClient.cache.evict({ fieldName: 'users' });
      apolloClient.cache.gc(); // Force garbage collection
      
      // Refetch data
      console.log('Refetching data...');
      
      // Set a small timeout to ensure the cache is cleared before refetching
      return new Promise((resolve) => {
        setTimeout(async () => {
          const results = await Promise.all([
            refetch({ fetchPolicy: 'network-only' }),
            apolloClient.query({
              query: GET_USERS,
              fetchPolicy: 'network-only'
            })
          ]);
          resolve(results);
        }, 300); // Small delay to ensure cache is cleared
      });
    } catch (error) {
      console.error('Error clearing cache and refetching:', error);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    clearCacheAndRefetch().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };
  
  const handleAccept = async (id) => {
    setActionInProgress(prev => ({ ...prev, [id]: 'accepting' }));
    
    try {
      // First update local state optimistically
      setProcessedRequests(prev => ({
        ...prev,
        [id]: 'APPROVED'
      }));
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => ({ 
          ...prev, 
          _uiStatus: 'APPROVED' 
        }));
      }
      
      // Then make the API call
      const { data: mutationData } = await acceptRequest({
        variables: { id: parseInt(id) }
      });
      
      if (mutationData?.acceptAccountRequest) {
        showToast("Account request accepted successfully");
        
        // Clear cache and refetch to ensure data consistency
        await clearCacheAndRefetch();
      } else {
        throw new Error("No response data from accept mutation");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      showToast("Failed to accept request: " + (error.message || 'Unknown error'), "error");
      
      // Revert optimistic update on error
      setProcessedRequests(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => ({ 
          ...prev, 
          _uiStatus: undefined 
        }));
      }
    } finally {
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };
  
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this account request?")) {
      return;
    }
    
    // Set action in progress for UI feedback
    setActionInProgress(prev => ({ ...prev, [id]: 'rejecting' }));
    
    try {
      // First update local state optimistically
      setProcessedRequests(prev => ({
        ...prev,
        [id]: 'REJECTED'
      }));
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => ({ 
          ...prev,
          _uiStatus: 'REJECTED' 
        }));
      }
      
      // IMPORTANT: Convert id to a number - backend expects Integer for rejectAccountRequest
      const numericId = parseInt(id, 10);
      console.log('Rejecting request ID:', numericId);
      
      // Make the API call - using network-only policy to bypass cache
      // Note: rejectAccountRequest is defined as a Query in the backend, not a Mutation
      const { data: queryData } = await apolloClient.query({
        query: REJECT_ACCOUNT_REQUEST,
        variables: { id: numericId },
        fetchPolicy: 'network-only'
      });
      
      console.log('Reject response:', queryData);
      
      if (queryData?.rejectAccountRequest) {
        showToast("Account request rejected successfully");
        
        // Update local state with rejection status
        setProcessedRequests(prev => ({
          ...prev,
          [id]: 'REJECTED'
        }));
        
        // If this request was selected, ensure its UI reflects the rejection
        if (selectedRequest?.id === id) {
          setSelectedRequest(prev => ({
            ...prev,
            _uiStatus: 'REJECTED'
          }));
        }
        
        // Update the requests list to reflect the rejected status
        setRequests(prev => 
          prev.map(req => 
            req.id === id 
              ? { ...req, _uiStatus: 'REJECTED' } 
              : req
          )
        );
        
        // Clear cache and refetch fresh data from server
        await clearCacheAndRefetch();
      } else {
        throw new Error("No response data from reject query");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast("Failed to reject request: " + (error.message || 'Unknown error'), "error");
      
      // Revert optimistic update on error
      setProcessedRequests(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => ({ 
          ...prev,
          _uiStatus: undefined 
        }));
      }
    } finally {
      setActionInProgress(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    
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
  
  const getStatusStyles = (request) => { 
    const requestId = request.id;
    
    // Check for in-progress actions first
    if (actionInProgress[requestId]) {
      return {
        className: 'badge badge-neutral',
        text: actionInProgress[requestId] === 'accepting' ? 'Accepting...' : 'Rejecting...'
      };
    }

    // Check for _uiStatus first (immediate UI feedback)
    if (request._uiStatus) {
      const status = request._uiStatus.toUpperCase();
      switch(status) {
        case 'APPROVED':
          return {
            className: 'badge badge-success',
            text: 'Approved'
          };
        case 'REJECTED':
          return {
            className: 'badge badge-danger',
            text: 'Rejected'
          };
        default:
          break;
      }
    }

    // Then check processedRequests (for persistent state)
    if (processedRequests[requestId]) {
      const status = processedRequests[requestId].toUpperCase();
      switch(status) {
        case 'APPROVED':
          return {
            className: 'badge badge-success',
            text: 'Approved'
          };
        case 'REJECTED':
          return {
            className: 'badge badge-danger',
            text: 'Rejected'
          };
        default:
          break;
      }
    }
    
    // Default/fallback
    return {
      className: 'badge badge-neutral',
      text: 'Pending'
    };
  };
  
  const isRequestProcessed = (request) => {
    const requestId = request.id;
    const isProcessed = 
      processedRequests[requestId] === 'APPROVED' || 
      processedRequests[requestId] === 'REJECTED' ||
      request._uiStatus === 'APPROVED' ||
      request._uiStatus === 'REJECTED';
    
    return isProcessed;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, request, index) => {
    switch (e.key) {
      case 'Enter':
      case ' ': // Space key
        e.preventDefault();
        setSelectedRequest(request);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (index < requests.length - 1) {
          const nextCardElement = document.querySelector(`[data-index="${index + 1}"]`);
          if (nextCardElement) {
            nextCardElement.focus();
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          const prevCardElement = document.querySelector(`[data-index="${index - 1}"]`);
          if (prevCardElement) {
            prevCardElement.focus();
          }
        }
        break;
      default:
        break;
    }
  };

  const handleCloseDetail = () => {
    setSelectedRequest(null);
    // Return focus to the last selected card
    setTimeout(() => {
      const lastSelectedCard = document.querySelector('.request-card.selected');
      if (lastSelectedCard) {
        lastSelectedCard.focus();
      } else if (requestListRef.current) {
        requestListRef.current.focus();
      }
    }, 0);
  };

  // Render components (original helper components)
  const ToastNotifications = () => (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
          role="alert"
        >
          {toast.type === 'success' ? (
            <span role="img" aria-label="success" className="toast-icon">✓</span>
          ) : (
            <span role="img" aria-label="error" className="toast-icon">⚠</span>
          )}
          {toast.message}
        </div>
      ))}
    </div>
  );
  
  const EmptyStateView = () => (
    <div className="empty-state" role="status">
      <div className="empty-state-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h3 className="empty-state-title">All Caught Up!</h3>
      <p className="empty-text">
        There are no pending account requests to review at the moment.
      </p>
      <button 
        className="btn btn-primary"
        onClick={handleRefresh}
        aria-label="Refresh account requests"
      >
        Refresh
      </button>
    </div>
  );
  
  const LoadingStateView = () => (
    <div className="loading-spinner" role="status" aria-label="Loading account requests">
      <div className="spinner"></div>
      <p className="loading-text">Loading account requests...</p>
    </div>
  );
  
  const ErrorStateView = () => (
    <div className="error-container" role="alert">
      <h3 className="error-title">
        Failed to load account requests
      </h3>
      <p className="error-message">{error?.message || 'An unknown error occurred'}</p>
      <button
        className="btn btn-primary"
        onClick={handleRefresh}
        aria-label="Try loading account requests again"
      >
        Try Again
      </button>
    </div>
  );

  // Enhanced RequestCard and RequestDetailView from the "spinner" edit
  const RequestCard = ({ request, index }) => {
    const statusObj = getStatusStyles(request);
    const isProcessed = isRequestProcessed(request);
    const currentAction = actionInProgress[request.id];
    const shouldDisableButtons = isProcessed || !!currentAction;
    const isSelected = selectedRequest?.id === request.id;

    let buttonLabel = "Accept";
    if (currentAction === 'accepting') buttonLabel = "Accepting...";
    
    let rejectButtonLabel = "Reject";
    if (currentAction === 'rejecting') rejectButtonLabel = "Rejecting...";

    // Determine status text for display
    const statusText = request._uiStatus || 
                       processedRequests[request.id] || 
                       'pending';

    return (
      <div
        ref={isSelected ? selectedCardRef : null}
        data-index={index}
        onClick={() => !currentAction && setSelectedRequest(request)}
        onKeyDown={(e) => !currentAction && handleKeyDown(e, request, index)}
        className={`card request-card ${isSelected ? 'selected' : ''} ${isProcessed ? 'processed' : ''} ${currentAction ? 'action-in-progress' : ''}`}
        tabIndex={currentAction ? -1 : 0}
        role="button"
        aria-selected={isSelected}
        aria-label={`${request.name}'s account request, status: ${statusObj.text}`}
        aria-disabled={shouldDisableButtons || !!currentAction}
        aria-busy={!!currentAction}
        data-request-id={request.id}
        data-status={statusText}
      >
        {currentAction && <div className="card-action-spinner"></div>}
        <div className="request-card-content">
          <div className="request-card-header">
            <div className="request-user-info">
              <div className="user-avatar">
                {request.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="request-user-name">{request.name}</h3>
                <p className="request-date">
                  {formatDate(request.createdAt)}
                </p>
              </div>
            </div>
            <div className={`request-status-badge ${statusObj.className}`}>
              {statusObj.text}
            </div>
          </div>
          
          <div className="request-details">
            <div className="request-detail-item">
              <strong className="detail-label">Email:</strong>
              <span>{request.email}</span>
            </div>
            <div className="request-detail-item">
              <strong className="detail-label">ID:</strong>
              <span>{request.universityId}</span>
            </div>
          </div>
          
          <div className="request-actions">
            {isProcessed ? (
              <div className="request-status-note">
                Request {statusText.toLowerCase()}
              </div>
            ) : (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleReject(request.id);
                  }}
                  disabled={shouldDisableButtons}
                  className="btn btn-outline btn-small"
                  aria-label={`Reject ${request.name}'s request`}
                >
                  {rejectButtonLabel}
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleAccept(request.id);
                  }}
                  disabled={shouldDisableButtons}
                  className="btn btn-primary btn-small"
                  aria-label={`Accept ${request.name}'s request`}
                >
                  {buttonLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const RequestDetailView = () => {
    if (!selectedRequest) return null;
    
    const statusObj = getStatusStyles(selectedRequest);
    const isProcessed = isRequestProcessed(selectedRequest);
    const currentAction = actionInProgress[selectedRequest.id];
    const shouldDisableButtons = isProcessed || !!currentAction;
    
    // Use _uiStatus first, then processedRequests, for best UI responsiveness
    const processedStatus = selectedRequest._uiStatus || 
                           processedRequests[selectedRequest.id] || 
                           '';

    let acceptButtonLabel = "Accept Request";
    if (currentAction === 'accepting') acceptButtonLabel = "Accepting...";
    
    let rejectButtonLabel = "Reject Request";
    if (currentAction === 'rejecting') rejectButtonLabel = "Rejecting...";
    
    return (
      <div className="section-container request-detail" role="region" aria-label="Request details">
        {currentAction && <div className="detail-action-spinner"></div>}
        <div className={`request-detail-content ${currentAction ? 'action-in-progress-detail' : '' }`}
             data-request-id={selectedRequest.id}
             data-status={processedStatus}>
          <div className="request-detail-header">
            <div className="request-user-profile">
              <div className="user-avatar large">
                {selectedRequest.name.charAt(0).toUpperCase()}
              </div>
              <div className="request-user-main-info">
                <div className="request-user-title">
                  <h2 className="detail-name">{selectedRequest.name}</h2>
                  <div className={`request-status-badge ${statusObj.className}`}>
                    {statusObj.text}
                  </div>
                </div>
                <p className="request-date detail-submission-date">
                  Request submitted {formatDate(selectedRequest.createdAt)}
                </p>
              </div>
            </div>
            <div className="detail-header-actions">
              <button
                onClick={handleRefresh}
                className={`refresh-button btn btn-secondary ${isRefreshing ? 'refreshing' : ''}`}
                disabled={isRefreshing}
                aria-label="Refresh data"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6"></path>
                  <path d="M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
              <button
                className="close-button"
                onClick={handleCloseDetail}
                aria-label="Close details"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="detail-info-container">
            <h3 className="detail-section-title">Applicant Information</h3>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <p className="detail-info-label">Email Address</p>
                <p className="detail-info-value">{selectedRequest.email}</p>
              </div>
              <div className="detail-info-item">
                <p className="detail-info-label">University ID</p>
                <p className="detail-info-value">{selectedRequest.universityId}</p>
              </div>
              <div className="detail-info-item">
                <p className="detail-info-label">Gender</p>
                <p className="detail-info-value text-capitalize">{selectedRequest.gender}</p>
              </div>
              <div className="detail-info-item">
                <p className="detail-info-label">Phone Number</p>
                <p className="detail-info-value">{selectedRequest.phoneNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="detail-actions-footer">
            {isProcessed ? (
              <div className={`request-status-message ${processedStatus.toLowerCase()}`}>
                This request has been {processedStatus.toLowerCase()}.
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={shouldDisableButtons}
                  className="btn btn-outline"
                  aria-label={`Reject ${selectedRequest.name}'s request`}
                >
                  {rejectButtonLabel}
                </button>
                <button
                  onClick={() => handleAccept(selectedRequest.id)}
                  disabled={shouldDisableButtons}
                  className="btn btn-primary"
                  aria-label={`Accept ${selectedRequest.name}'s request`}
                >
                  {acceptButtonLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main return block of AccountRequests component
  return (
    <main className="main-container" ref={mainContentRef}>
      <header className="page-header">
        <div className="header-content">
          <h1 className="main-title">Account Requests</h1>
          <p className="header-description">
            Review and manage pending requests for new user accounts.
          </p>
        </div>
        
        {!loading && !error && requests.length > 0 && (
          <div className="header-actions">
            <div className="stat-container" title="Requests received today">
              <span className="stat-label">Today</span>
              <span className="stat-value">{stats.today}</span>
            </div>
            <div className="stat-container" title="Total pending requests">
              <span className="stat-label">Total</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <button
              onClick={handleRefresh}
              className={`btn btn-secondary refresh-button ${isRefreshing ? 'refreshing' : ''}`}
              disabled={isRefreshing}
              aria-label="Refresh account requests"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        )}
      </header>
      
      <div className="content-area">
        {/* Loading, error, and empty states */}
        {loading && !requests.length ? <LoadingStateView /> : null}
        {error ? <ErrorStateView /> : null}
        {!loading && !error && !requests.length ? <EmptyStateView /> : null}
        
        {/* Main request list with proper scrolling */}
        {!loading && !error && requests.length > 0 && (
          <div 
            className={`request-list-container ${selectedRequest ? 'detail-open' : ''}`}
            ref={requestListRef}
            role="list"
            aria-label="Account requests list" // This was in the first JS edit
          >
            <div className="account-requests-scroll-area"> {/* This was in the first JS edit */}
              {requests.map((request, index) => (
                <RequestCard key={request.id} request={request} index={index} />
              ))}
            </div>
          </div>
        )}
        
        {/* Detail panel - conditionally shown */}
        {selectedRequest && (
          <div className="request-detail-panel"> {/* This was in the first JS edit */}
            <RequestDetailView />
          </div>
        )}
      </div>
      
      {/* Toasts - fixed position */}
      <ToastNotifications />
    </main>
  );
};

export default AccountRequests; 