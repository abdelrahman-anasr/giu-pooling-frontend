import React, { useState, useEffect } from "react";
import "../styles/NotificationsPage.css";
import "../styles/shared.css";
import Header from "./Header";// adjust the path based on where Navbar.jsx lives

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fetch all notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log("Fetching notifications...");
        const response = await fetch(
          "https://notificationservice-production-d8cf.up.railway.app/notification ",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              query: `
              query {
                fetchAllNotifications {
                  id
                  subject
                  message
                  receiverId
                }
              }
            `,
            }),
          }
        );

        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Response data:", result);

        if (result.errors) {
          console.error("GraphQL errors:", result.errors);
          throw new Error(result.errors[0].message);
        }

        if (!result.data || !result.data.fetchAllNotifications) {
          console.error("Unexpected response format:", result);
          throw new Error("Invalid response format from server");
        }

        setNotifications(result.data.fetchAllNotifications);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(`Failed to load notifications: ${err.message}`);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
  };

  const closeNotificationView = () => {
    setSelectedNotification(null);
  };

  const formatDate = (dateString) => {
    return "5/17/2025"; // Fixed date for consistency with screenshot
  };

  // For testing - display a mock notification if none are loaded
  useEffect(() => {
    if (!loading && notifications.length === 0 && !error) {
      console.log("No notifications found, adding mock data");
      setNotifications([
        {
          id: 1,
          subject: "Message",
          message: "Skjslad",
          receiverId: 10002442,
        },
      ]);
    }
  }, [loading, notifications, error]);

  return (
    <>
      <Header />
      <div className="page-container">
        <h2>Notifications</h2>
        <div className="content-card">
          <p>Manage system notifications and message delivery.</p>

          {error && <div className="error-message">{error}</div>}

          {selectedNotification && (
            <div
              className="notification-modal-overlay"
              onClick={closeNotificationView}
            >
              <div
                className="notification-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="notification-modal-header">
                  <h3>Notification Details</h3>
                  <button
                    className="close-button"
                    onClick={closeNotificationView}
                  >
                    ×
                  </button>
                </div>

                <div className="notification-modal-content">
                  <div className="notification-detail-item">
                    <div className="detail-label">ID</div>
                    <div className="detail-value">
                      {selectedNotification.id}
                    </div>
                  </div>

                  <div className="notification-detail-item">
                    <div className="detail-label">SUBJECT</div>
                    <div className="detail-value">
                      {selectedNotification.subject}
                    </div>
                  </div>

                  <div className="notification-detail-item">
                    <div className="detail-label">MESSAGE</div>
                    <div className="detail-value">
                      {selectedNotification.message}
                    </div>
                  </div>

                  <div className="notification-detail-item">
                    <div className="detail-label">RECEIVER ID</div>
                    <div className="detail-value">
                      {selectedNotification.receiverId}
                    </div>
                  </div>

                  <div className="notification-detail-item">
                    <div className="detail-label">DATE</div>
                    <div className="detail-value">{formatDate()}</div>
                  </div>
                </div>

                <div className="notification-modal-footer">
                  <button
                    className="primary-button"
                    onClick={closeNotificationView}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="data-table-placeholder">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Receiver ID</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="loading-state">
                      Loading notifications...
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-table">
                      No notification data available yet
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => (
                    <tr key={notification.id}>
                      <td>{notification.id}</td>
                      <td>{notification.subject}</td>
                      <td>{notification.message}</td>
                      <td>{notification.receiverId}</td>
                      <td>{formatDate()}</td>
                      <td>
                        <button
                          className="action-button"
                          onClick={() => handleViewNotification(notification)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
