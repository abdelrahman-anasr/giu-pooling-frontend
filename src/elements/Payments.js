import React, { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useLazyQuery } from "@apollo/client";
import "../styles/Payments.css"; // Import CSS

// Apollo Client for PaymentService
const paymentClient = new ApolloClient({
  uri: "https://paymentservice-production-3958.up.railway.app/payment", // Use the consolidated GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// GraphQL Queries & Mutations
const GET_PAYMENTS = gql`
  query FetchAllPayments {
    fetchAllPayments {
      id
      bookingId
      userId
      amount
      status
      currency
    }
  }
`;

// Changed from mutation to query to match backend schema
const ISSUE_REFUND = gql`
  query IssueRefund($bookingId: Int!) {
    issueRefund(bookingId: $bookingId) {
      id
      status
    }
  }
`;

const PaymentDisplay = ({ setHasData }) => {
  const { loading, error, data, refetch } = useQuery(GET_PAYMENTS, {
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Error fetching payments:", error);
    }
  });
  
  // Use lazyQuery for the refund operation
  const [executeRefund, { loading: refundLoading }] = useLazyQuery(ISSUE_REFUND, {
    fetchPolicy: "no-cache", // Don't cache this query
    onCompleted: (data) => {
      if (data.issueRefund) {
        alert(`Refund issued successfully! Status: ${data.issueRefund.status}`);
        refetch(); // Refresh the payments list
      }
    },
    onError: (error) => {
      console.error("Error issuing refund:", error);
      alert(`Failed to issue refund: ${error.message}`);
    }
  });
  
  const [authError, setAuthError] = useState(false);
  const [refundingId, setRefundingId] = useState(null);

  useEffect(() => {
    if (error?.message.includes("Unauthorized")) {
      setAuthError(true);
      setHasData(false);
    } else {
      setAuthError(false);
    }

    setHasData(data?.fetchAllPayments?.length > 0);
  }, [data, error, setHasData]);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
  
  if (authError) return (
    <div className="error-container">
      <div className="auth-error">Authentication Error: You are not authorized to view this data.</div>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <h3 className="error-title">Failed to load payments</h3>
      <p className="error-message">{error.message}</p>
      <button 
        onClick={() => refetch()}
        style={{
          backgroundColor: "#FFD281",
          color: "#000000",
          border: "none",
          borderRadius: "4px",
          padding: "8px 16px",
          fontWeight: "500",
          cursor: "pointer",
          marginTop: "10px"
        }}
      >
        Try Again
      </button>
    </div>
  );
  
  if (!data?.fetchAllPayments || data.fetchAllPayments.length === 0) return (
    <div className="empty-state">
      <p className="empty-text">No payment data available.</p>
    </div>
  );

  const handleRefund = async (bookingId) => {
    if (window.confirm(`Are you sure you want to issue a refund for booking #${bookingId}?`)) {
      try {
        setRefundingId(bookingId);
        // Execute the refund query
        executeRefund({ 
          variables: { 
            bookingId: parseInt(bookingId, 10) // Ensure it's an integer
          } 
        });
      } catch (err) {
        console.error("Error initiating refund:", err.message);
        alert(`Failed to initiate refund: ${err.message}`);
      } finally {
        // Reset the refunding state after a short delay to show loading state
        setTimeout(() => setRefundingId(null), 1000);
      }
    }
  };

  return (
    <div className="data-box">
      <div className="section-title" style={{ marginBottom: 16 }}>Payment Data</div>
      <div className="payment-cards-container" style={{ 
          maxHeight: "550px", 
          overflowY: "auto", 
          overflowX: "hidden",
          padding: "16px",
          border: "1px solid #EDEDED",
          borderRadius: "10px",
          backgroundColor: "#FFF8EF"
        }}>
        {data.fetchAllPayments.map((payment) => (
          <div key={payment.id} className="payment-card" style={{
            border: "1px solid #000000",
            borderRadius: "10px",
            padding: "16px",
            backgroundColor: "#FFFFFF",
            marginBottom: "16px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            opacity: refundingId === payment.bookingId ? 0.7 : 1,
            transition: "opacity 0.2s ease"
          }}>
            <div className="payment-field">
              <span className="field-label">Payment ID:</span>
              <span className="field-value">{payment.id}</span>
            </div>
            <div className="payment-field">
              <span className="field-label">Booking ID:</span>
              <span className="field-value">{payment.bookingId}</span>
            </div>
            <div className="payment-field">
              <span className="field-label">User ID:</span>
              <span className="field-value">{payment.userId}</span>
            </div>
            <div className="payment-field">
              <span className="field-label">Amount:</span>
              <span className="field-value">{payment.amount} {payment.currency}</span>
            </div>
            <div className="payment-field">
              <span className="field-label">Status:</span>
              <span className={`status-badge ${payment.status === "Paid" ? "status-paid" : "status-unpaid"}`}>
                {payment.status}
              </span>
            </div>
            {payment.status === "Paid" && (
              <button 
                onClick={() => handleRefund(payment.bookingId)}
                className="refund-button"
                disabled={refundLoading || refundingId === payment.bookingId}
                style={{ 
                  cursor: refundLoading || refundingId === payment.bookingId ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {refundingId === payment.bookingId ? (
                  <>
                    <span 
                      style={{
                        display: "inline-block",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        border: "2px solid #FFFFFF",
                        borderTopColor: "transparent",
                        marginRight: "8px",
                        animation: "spin 1s linear infinite"
                      }}
                    />
                    Processing...
                  </>
                ) : "Request Refund"}
              </button>
            )}
          </div>
        ))}
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

const Payments = ({ setHasData }) => {
  return (
    <ApolloProvider client={paymentClient}>
      <div className="payments-container">
        <h2 className="payments-title">Payment Management</h2>
        <PaymentDisplay setHasData={setHasData} />
      </div>
    </ApolloProvider>
  );
};

export default Payments;
