/* eslint-disable */
import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useMutation } from "@apollo/client";
import "../styles/Notifications.css"; // Import CSS

// Create Apollo Client for NotificationService
const notificationsClient = new ApolloClient({
  uri: "https://notificationservice-production-d8cf.up.railway.app/notification", // NotificationService endpoint
  cache: new InMemoryCache(),
  credentials: "include",
});

// Define GraphQL queries and mutations
const GET_NOTIFICATIONS = gql`
  query FetchAllNotifications {
    fetchAllNotifications {
      id
      subject
      message
      receiverId
    }
  }
`;

const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($type: String!, $to: String!, $data: Json!) {
    createNotification(type: $type, to: $to, data: $data) {
      id
      subject
      message
      receiverId
    }
  }
`;

const NotificationsDisplay = () => {
  const { loading, error, data } = useQuery(GET_NOTIFICATIONS);
  const [createNotification] = useMutation(CREATE_NOTIFICATION);

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <h3 className="error-title">Failed to load notifications</h3>
      <p className="error-message">{error.message}</p>
    </div>
  );

  return (
    <div className="data-box">
      <div className="section-title" style={{ marginBottom: 16 }}>Notifications</div>
      {!data || !data.fetchAllNotifications || data.fetchAllNotifications.length === 0 ? (
        <div className="empty-state">
          <p className="empty-text">No notifications available</p>
        </div>
      ) : (
        <div className="card-container">
      {data.fetchAllNotifications.map((notification) => (
        <div key={notification.id} className="notification-card">
              <div className="card-header">
                Subject: {notification.subject}
              </div>
              <div className="card-body">
                Message: {notification.message}
              </div>
              <div className="card-footer">
                Receiver ID: {notification.receiverId}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Notifications = () => {
  return (
    <ApolloProvider client={notificationsClient}>
      <div className="dashboard-container">
      <h2 className="dashboard-title">Admin Notification Dashboard</h2>
      <NotificationsDisplay />
      </div>
    </ApolloProvider>
  );
};

export default Notifications;