/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Header from "./Header";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";
import "../styles/BookingsPage.css";
import "../styles/shared.css";

// Create Apollo Client for BookingService
const bookingClient = new ApolloClient({
  uri: " https://bookingservice-production-4772.up.railway.app/booking",
  cache: new InMemoryCache(),
  credentials: "include",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// GraphQL queries
const FETCH_ALL_BOOKINGS = gql`
  query FetchAllBookings {
    fetchAllBookings {
      id
      studentId
      rideId
      status
      price
    }
  }
`;

const FETCH_BOOKING = gql`
  query FetchBooking($id: Int!) {
    fetchBooking(id: $id) {
      id
      studentId
      rideId
      status
      price
    }
  }
`;

// Component that uses Apollo hooks
const BookingsContent = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [viewMode, setViewMode] = useState("card"); // card or table
  const [hoveredBooking, setHoveredBooking] = useState(null);

  // Fetch bookings data
  const {
    loading: bookingsLoading,
    error: bookingsError,
    data: bookingsData,
    refetch: refetchBookings,
  } = useQuery(FETCH_ALL_BOOKINGS, {
    fetchPolicy: "network-only",
  });

  // Fetch single booking data
  const {
    loading: bookingDetailLoading,
    error: bookingDetailError,
    data: bookingDetailData,
  } = useQuery(FETCH_BOOKING, {
    variables: { id: selectedBooking || -1 },
    skip: !selectedBooking,
    fetchPolicy: "network-only",
  });

  // Check for auth errors
  useEffect(() => {
    if (bookingsError?.message.includes("Unauthorized")) {
      setAuthError(true);
    } else {
      setAuthError(false);
    }
  }, [bookingsError]);

  // View booking details
  const handleViewBooking = (bookingId) => {
    setSelectedBooking(bookingId);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refetchBookings();
  };

  if (bookingsLoading)
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p>Loading booking data...</p>
      </div>
    );

  if (authError)
    return (
      <div className="error-container">
        <div className="error-title">Authentication Error</div>
        <div className="error-message">
          You are not authorized to view this data.
        </div>
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/login")}
        >
          Go to Login
        </button>
      </div>
    );

  if (bookingsError && !authError)
    return (
      <div className="error-container">
        <div className="error-title">Failed to load bookings</div>
        <div className="error-message">{bookingsError.message}</div>
        <button className="btn btn-primary" onClick={handleRefresh}>
          Try Again
        </button>
      </div>
    );

  const bookings = bookingsData?.fetchAllBookings || [];

  return (
    <div className="page-container">
      <h2 className="page-title">Bookings Management</h2>

      <div className="content-card">
        {/* Main Content */}
        {!bookings || bookings.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">No booking data available yet.</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="scrollable-container">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`card ${
                  hoveredBooking === booking.id ? "card-hover" : ""
                }`}
                onMouseEnter={() => setHoveredBooking(booking.id)}
                onMouseLeave={() => setHoveredBooking(null)}
              >
                <div
                  className={`card-title status-${booking.status.toLowerCase()}`}
                >
                  Booking #{booking.id}
                </div>
                <div className="card-body">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "150px 1fr",
                      gap: "8px",
                    }}
                  >
                    <strong>Student ID:</strong>{" "}
                    <span>{booking.studentId}</span>
                    <strong>Ride ID:</strong> <span>{booking.rideId}</span>
                    <strong>Status:</strong>
                    <span
                      className={`badge ${
                        booking.status === "Confirmed"
                          ? "badge-success"
                          : booking.status === "Cancelled"
                          ? "badge-danger"
                          : "badge-neutral"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <strong>Price:</strong>{" "}
                    <span>${booking.price.toFixed(2)}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="view-button"
                      onClick={() => handleViewBooking(booking.id)}
                    >
                      View Details
                    </button>
                    {booking.status === "Pending" && (
                      <>
                        <button className="approve-button">Approve</button>
                        <button className="reject-button">Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student ID</th>
                  <th>Ride ID</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={hoveredBooking === booking.id ? "row-hover" : ""}
                    onMouseEnter={() => setHoveredBooking(booking.id)}
                    onMouseLeave={() => setHoveredBooking(null)}
                  >
                    <td>{booking.id}</td>
                    <td>{booking.studentId}</td>
                    <td>{booking.rideId}</td>
                    <td>
                      <span
                        className={`badge ${
                          booking.status === "Confirmed"
                            ? "badge-success"
                            : booking.status === "Cancelled"
                            ? "badge-danger"
                            : "badge-neutral"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>${booking.price.toFixed(2)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="view-button"
                          onClick={() => handleViewBooking(booking.id)}
                        >
                          View
                        </button>
                        {booking.status === "Pending" && (
                          <>
                            <button className="approve-button-sm">✓</button>
                            <button className="reject-button-sm">✗</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button className="close-button" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-content">
              {bookingDetailLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : bookingDetailError ? (
                <div className="error-message">
                  Error: {bookingDetailError.message}
                </div>
              ) : bookingDetailData ? (
                <>
                  <div className="booking-detail-header">
                    <div className="booking-id">
                      Booking #{bookingDetailData.fetchBooking.id}
                    </div>
                    <span
                      className={`badge large ${
                        bookingDetailData.fetchBooking.status === "Confirmed"
                          ? "badge-success"
                          : bookingDetailData.fetchBooking.status ===
                            "Cancelled"
                          ? "badge-danger"
                          : "badge-neutral"
                      }`}
                    >
                      {bookingDetailData.fetchBooking.status}
                    </span>
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">Student ID:</span>
                      <span className="detail-value">
                        {bookingDetailData.fetchBooking.studentId}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ride ID:</span>
                      <span className="detail-value">
                        {bookingDetailData.fetchBooking.rideId}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">
                        {bookingDetailData.fetchBooking.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value price-value">
                        ${bookingDetailData.fetchBooking.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p>No booking data found</p>
              )}
            </div>
            <div className="modal-footer">
              {bookingDetailData?.fetchBooking.status === "Pending" && (
                <div className="modal-actions">
                  <button className="approve-button">Approve Booking</button>
                  <button className="reject-button">Reject Booking</button>
                </div>
              )}
              <button className="close-modal-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component that wraps with ApolloProvider
const BookingsPage = () => {
  return (
    <ApolloProvider client={bookingClient}>
      <Header />
      <BookingsContent />
    </ApolloProvider>
  );
};

export default BookingsPage;
