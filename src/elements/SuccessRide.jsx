import React from "react";

function formatTime(dtStr) {
  const d = new Date(dtStr);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function formatDate(dtStr) {
  const d = new Date(dtStr);
  return d.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

export default function SuccessRide({ ride }) {
  return (
    <div style={styles.container}>
      <div style={styles.successCard}>
        <div style={styles.header}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={styles.icon}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01l-3-3" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 style={styles.title}>Ride Created Successfully!</h1>
        </div>
        
        <p style={styles.subtitle}>Your ride has been created and is now available for passengers to book.</p>
        
        <div style={styles.rideDetailsSection}>
          <h2 style={styles.sectionTitle}>Ride Details</h2>
          
          <div style={styles.rideCard}>
            <div style={styles.rideHeader}>
              <div>
                <div style={styles.directionBadge}>
                  {ride.fromGiu ? "From GIU" : "To GIU"}
                </div>
                <h3 style={styles.locationTitle}>{ride.areaName}</h3>
              </div>
              <div style={styles.priceTag}>{ride.basePrice} EGP</div>
            </div>
            
            <div style={styles.divider}></div>
            
            <div style={styles.rideInfo}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Date:</span>
                <span style={styles.infoValue}>{formatDate(ride.time)}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Time:</span>
                <span style={styles.infoValue}>{formatTime(ride.time)}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Seats Available:</span>
                <span style={styles.infoValue}>{ride.seatsLeft}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Girls Only:</span>
                <span style={styles.infoValue}>{ride.girlsOnly ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style={styles.buttonsContainer}>
          <button style={styles.secondaryButton} onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </button>
          <button style={styles.primaryButton} onClick={() => window.location.href = '/createride'}>
            Create Another Ride
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 60px)",
    background: "linear-gradient(135deg, #f7efe5 0%, #f0f0f0 100%)",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  successCard: {
    maxWidth: 700,
    width: "100%",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
    padding: 32,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  rideDetailsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  rideCard: {
    border: "1px solid #eee",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  rideHeader: {
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: "#f9f9f9",
  },
  directionBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 20,
    background: "#e3f2fd",
    color: "#1976d2",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 0,
    color: "#333",
  },
  priceTag: {
    background: "#f3b664",
    color: "white",
    fontWeight: "bold",
    padding: "12px 16px",
    borderRadius: 8,
    fontSize: 18,
  },
  divider: {
    height: 1,
    background: "#eee",
    width: "100%",
  },
  rideInfo: {
    padding: 20,
    display: "flex",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "50%",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 16,
  },
  primaryButton: {
    background: "linear-gradient(to right, #f3b664, #ec994b)",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "12px 24px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(243, 182, 100, 0.2)",
  },
  secondaryButton: {
    background: "white",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "12px 24px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
  }
};
