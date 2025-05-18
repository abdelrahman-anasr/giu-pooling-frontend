// PaymentsPage.jsx

import React, { useState, useEffect } from "react";
import "../styles/PaymentsPage.css";
import "../styles/shared.css";
import "../styles/BookingsPage.css";
import Header from "../elements/Header";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
  useQuery,
  useLazyQuery,
  ApolloProvider,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// GraphQL queries
const FETCH_ALL_PAYMENTS = gql`
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

const FETCH_ALL_SYSTEM_TRANSACTIONS = gql`
  query FetchAllSystemTransactions {
    fetchAllSystemTransactions {
      id
      type
      amount
      sentTo
    }
  }
`;

const ISSUE_REFUND_QUERY = gql`
  query IssueRefund($bookingId: Int!) {
    issueRefund(bookingId: $bookingId) {
      id
      status
    }
  }
`;

const httpLink = createHttpLink({
  uri: " https://paymentservice-production-3958.up.railway.app/payment",
  credentials: "include",
  headers: {
    Authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  },
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      toast.error(`GraphQL Error: ${message}`);
    });
  }
  if (networkError) toast.error(`Network Error: ${networkError.message}`);
});

const paymentClient = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
    },
    query: { fetchPolicy: "network-only", nextFetchPolicy: "network-only" },
  },
});

const PaymentsContent = () => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [refundError, setRefundError] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    loading: paymentsLoading,
    data: paymentsData,
    refetch: refetchPayments,
  } = useQuery(FETCH_ALL_PAYMENTS, {
    fetchPolicy: "network-only",
    onError: (error) => {
      if (error.message.includes("Unauthorized")) {
        setAuthError(true);
      }
    },
    variables: { dummy: refreshTrigger },
  });

  const { data: transactionsData, refetch: refetchTransactions } = useQuery(
    FETCH_ALL_SYSTEM_TRANSACTIONS,
    {
      fetchPolicy: "network-only",
      variables: { dummy: refreshTrigger },
    }
  );

  const forceRefreshData = async () => {
    try {
      paymentClient.cache.evict({ fieldName: "fetchAllPayments" });
      paymentClient.cache.evict({ fieldName: "fetchAllSystemTransactions" });
      paymentClient.cache.gc();

      setRefreshTrigger((prev) => prev + 1);
      await refetchPayments({ fetchPolicy: "network-only" });
      await refetchTransactions({ fetchPolicy: "network-only" });
      toast.info("Data refreshed");
    } catch (error) {
      toast.error(`Error refreshing data: ${error.message}`);
    }
  };

  const [{ loading: refundLoading }] = useLazyQuery(ISSUE_REFUND_QUERY, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      if (data?.issueRefund) {
        toast.success("Refund processed successfully!");
        setRefundSuccess(true);
        setTimeout(() => {
          forceRefreshData();
        }, 500);
        setIsConfirmModalOpen(false);
      } else {
        toast.error("No data returned from refund operation");
        setRefundError("No data returned from refund operation");
      }
    },
    onError: (error) => {
      toast.error(`Refund failed: ${error.message}`);
      setRefundError(error.message);
      setIsConfirmModalOpen(false);
    },
  });

  useEffect(() => {
    if (refundSuccess) {
      setRefundSuccess(false);
    }
  }, [refundSuccess]);

  const handleRefundClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsConfirmModalOpen(true);
    setRefundError(null);
  };

  const processRefund = async (bookingId) => {
    try {
      const response = await fetch(
        " https://paymentservice-production-3958.up.railway.app/payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token")
              ? `Bearer ${localStorage.getItem("token")}`
              : "",
          },
          credentials: "include",
          body: JSON.stringify({
            query: `
            query IssueRefund($bookingId: Int!) {
              issueRefund(bookingId: $bookingId) {
                id
                status
              }
            }
          `,
            variables: { bookingId: parseInt(bookingId) },
          }),
        }
      );

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      if (result.data?.issueRefund) {
        toast.success("Refund processed successfully!");
        setRefundSuccess(true);
        setTimeout(() => forceRefreshData(), 500);
      } else {
        throw new Error("No data returned from refund operation");
      }
    } catch (error) {
      toast.error(`Refund error: ${error.message}`);
      setRefundError(error.message);
    }
  };

  const confirmRefund = () => {
    if (selectedBookingId) processRefund(selectedBookingId);
  };

  const getSummaryData = () => {
    if (!paymentsData?.fetchAllPayments)
      return { total: 0, pending: 0, completed: 0, refunded: 0 };

    const payments = paymentsData.fetchAllPayments;
    return {
      total: payments.length,
      pending: payments.filter((p) =>
        ["pending", "unpaid", "", null, undefined].includes(
          (p.status || "").toLowerCase()
        )
      ).length,
      completed: payments.filter((p) =>
        ["paid", "completed"].includes((p.status || "").toLowerCase())
      ).length,
      refunded: payments.filter(
        (p) => (p.status || "").toLowerCase() === "refunded"
      ).length,
    };
  };

  const summary = getSummaryData();

  if (authError) {
    return (
      <div className="page-container">
        <h2>Payments</h2>
        <div className="content-card error-card">
          <h3>Authentication Error</h3>
          <p>You are not authorized to view this data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Payments</h2>
      <div className="content-card">
        <p>Monitor payment transactions and process refunds.</p>

        <div className="payment-summary">
          <div className="summary-card">
            <h3>Total Payments</h3>
            <p className="summary-value">{summary.total}</p>
          </div>
          <div className="summary-card">
            <h3>Pending</h3>
            <p className="summary-value">{summary.pending}</p>
          </div>
          <div className="summary-card">
            <h3>Completed</h3>
            <p className="summary-value">{summary.completed}</p>
          </div>
          <div className="summary-card">
            <h3>Refunded</h3>
            <p className="summary-value">{summary.refunded}</p>
          </div>
        </div>

        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <button className="refresh-button" onClick={forceRefreshData}>
            ⟳ Refresh Data
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Booking ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Currency</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentsLoading ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    <span className="spinner-small"></span> Loading payment
                    data...
                  </td>
                </tr>
              ) : paymentsData?.fetchAllPayments?.length > 0 ? (
                paymentsData.fetchAllPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className={
                      refundLoading && selectedBookingId === payment.bookingId
                        ? "row-processing"
                        : ""
                    }
                  >
                    <td>{payment.id}</td>
                    <td>{payment.bookingId}</td>
                    <td>{payment.userId}</td>
                    <td>{payment.amount}</td>
                    <td>
                      <span
                        className={`status-badge status-${(
                          payment.status || ""
                        ).toLowerCase()}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td>{payment.currency || "EGP"}</td>
                    <td>
                      {payment.status?.toLowerCase() === "paid" && (
                        <button
                          className="action-button refund-button"
                          onClick={() => handleRefundClick(payment.bookingId)}
                          disabled={refundLoading}
                        >
                          {refundLoading &&
                          selectedBookingId === payment.bookingId ? (
                            <span className="button-with-spinner">
                              <span className="spinner-small"></span>
                              Processing...
                            </span>
                          ) : (
                            "Issue Refund"
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table">
                    No payment data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h3 className="section-title">System Transactions</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Sent To (User ID)</th>
              </tr>
            </thead>
            <tbody>
              {transactionsData?.fetchAllSystemTransactions?.length > 0 ? (
                transactionsData.fetchAllSystemTransactions.map(
                  (transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.id}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.amount}</td>
                      <td>{transaction.sentTo}</td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan="4" className="empty-table">
                    No transaction data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Refund</h3>
            <p>
              Are you sure you want to issue a refund for booking #
              {selectedBookingId}?
            </p>
            <p>This action cannot be undone.</p>
            {refundError && <p className="error-message">{refundError}</p>}
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={refundLoading}
              >
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={confirmRefund}
                disabled={refundLoading}
              >
                {refundLoading ? (
                  <span className="button-with-spinner">
                    <span className="spinner-small"></span>Processing...
                  </span>
                ) : (
                  "Confirm Refund"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentsPage = () => (
  <ApolloProvider client={paymentClient}>
    <Header />
    <PaymentsContent />
  </ApolloProvider>
);

export default PaymentsPage;
