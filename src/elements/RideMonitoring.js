import React, { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from "@apollo/client";
import "../styles/Common.css";

// Create Apollo Clients for RideService and BookingService
const rideClient = new ApolloClient({
  uri: "https://rideservice-production.up.railway.app/ride", // Ensure correct GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: "include", // Ensures cookies are sent
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`, // Sends token in headers
  },
});

const bookingClient = new ApolloClient({
  uri: "https://bookingservice-production-4772.up.railway.app/booking", // Ensure correct GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: "include",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Define GraphQL queries
const GET_RIDES = gql`
  query FetchAllRides {
    fetchAllRides {
      id
      driverId
      time
      areaName
      basePrice
      seatsLeft 
      active
      fromGiu
      girlsOnly
    }
  }
`;

const GET_BOOKINGS = gql`
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

const RideDisplay = ({ setHasData }) => {
  const { loading, error, data } = useQuery(GET_RIDES);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (error?.message.includes("Unauthorized")) {
      setAuthError(true);
      setHasData(false);
    } else {
      setAuthError(false);
    }

    if (data?.fetchAllRides?.length > 0) {
      setHasData(true);
    } else {
      setHasData(false);
    }
  }, [data, error, setHasData]);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
  
  if (authError) return (
    <div className="error-container">
      <div className="error-title">Authentication Error</div>
      <div className="error-message">You are not authorized to view this data.</div>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-title">Failed to load rides</div>
      <div className="error-message">{error.message}</div>
    </div>
  );
  
  if (!data?.fetchAllRides || data.fetchAllRides.length === 0) return (
    <div className="empty-state">
      <p className="empty-text">No ride data available.</p>
    </div>
  );

  return (
    <div className="section-container">
      <div className="section-title">Ride Data</div>
      <div className="scrollable-container">
        {data.fetchAllRides.map((ride) => (
          <div key={ride.id} className="card">
            <div className="card-title">Ride #{ride.id}</div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                <strong>Driver ID:</strong> <span>{ride.driverId}</span>
                <strong>Time:</strong> <span>{ride.time}</span>
                <strong>Area:</strong> <span>{ride.areaName}</span>
                <strong>Base Price:</strong> <span>{ride.basePrice}</span>
                <strong>Seats Left:</strong> <span>{ride.seatsLeft}</span>
                <strong>Active:</strong> 
                <span className={`badge ${ride.active ? 'badge-success' : 'badge-neutral'}`}>
                  {ride.active ? "Yes" : "No"}
                </span>
                <strong>From GIU:</strong> <span>{ride.fromGiu ? "Yes" : "No"}</span>
                <strong>Girls Only:</strong> <span>{ride.girlsOnly ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BookingDisplay = ({ setHasData }) => {
  const { loading, error, data } = useQuery(GET_BOOKINGS);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (error?.message.includes("Unauthorized")) {
      setAuthError(true);
      setHasData(false);
    } else {
      setAuthError(false);
    }

    if (data?.fetchAllBookings?.length > 0) {
      setHasData(true);
    } else {
      setHasData(false);
    }
  }, [data, error, setHasData]);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
  
  if (authError) return (
    <div className="error-container">
      <div className="error-title">Authentication Error</div>
      <div className="error-message">You are not authorized to view this data.</div>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-title">Failed to load bookings</div>
      <div className="error-message">{error.message}</div>
    </div>
  );
  
  if (!data?.fetchAllBookings || data.fetchAllBookings.length === 0) return (
    <div className="empty-state">
      <p className="empty-text">No booking data available.</p>
    </div>
  );

  return (
    <div className="section-container">
      <div className="section-title">Booking Data</div>
      <div className="scrollable-container">
        {data.fetchAllBookings.map((booking) => (
          <div key={booking.id} className="card">
            <div className="card-title">Booking #{booking.id}</div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                <strong>Student ID:</strong> <span>{booking.studentId}</span>
                <strong>Ride ID:</strong> <span>{booking.rideId}</span>
                <strong>Status:</strong> 
                <span className={`badge ${booking.status === "Confirmed" ? 'badge-success' : booking.status === "Cancelled" ? 'badge-danger' : 'badge-neutral'}`}>
                  {booking.status}
                </span>
                <strong>Price:</strong> <span>{booking.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RideMonitoring = ({ setHasData }) => {
  return (
    <div className="main-container">
      <h2 className="main-title">Ride & Booking Management</h2>
      
      <ApolloProvider client={rideClient}>
        <RideDisplay setHasData={setHasData} />
      </ApolloProvider>

      <ApolloProvider client={bookingClient}>
        <BookingDisplay setHasData={setHasData} />
      </ApolloProvider>
    </div>
  );
};

export default RideMonitoring;
