import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessMessage() {
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Add animation delay
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div 
        style={{
          ...styles.card,
          opacity: animationComplete ? 1 : 0,
          transform: animationComplete ? 'translateY(0)' : 'translateY(20px)'
        }}
      >
        <div style={styles.iconContainer}>
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="none" 
            style={styles.checkIcon}
          >
            <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2" />
            <path 
              d="M8 12l3 3 5-6" 
              stroke="#4CAF50" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>
        
        <h1 style={styles.title}>
          Application Submitted!
        </h1>
        
        <p style={styles.message}>
          Your driver registration has been sent to the administrative team for review
        </p>
        
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f3b664" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div style={styles.infoText}>
            We'll notify you when there is an update regarding your application. The review process typically takes 1-2 business days.
          </div>
        </div>
        
        <div style={styles.nextStepsSection}>
          <h3 style={styles.nextStepsTitle}>What's Next?</h3>
          <ul style={styles.stepsList}>
            <li style={styles.step}>
              <div style={styles.bullet}></div>
              <span>Your application will be reviewed by our administrative team</span>
            </li>
            <li style={styles.step}>
              <div style={styles.bullet}></div>
              <span>You'll receive a notification when your status is updated</span>
            </li>
            <li style={styles.step}>
              <div style={styles.bullet}></div>
              <span>Once approved, you can start offering rides to other users</span>
            </li>
          </ul>
        </div>
        
        <div style={styles.buttonContainer}>
          <button 
            className="dashboard-button"
            onClick={goToDashboard}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f7efe5 0%, #f0f0f0 100%)",
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    padding: 40,
    borderRadius: 16,
    maxWidth: 640,
    width: "100%",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
    transition: "opacity 0.8s ease, transform 0.8s ease",
  },
  iconContainer: {
    margin: "0 auto 24px",
    width: 100,
    height: 100,
    borderRadius: 50,
    background: "#e9f7ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    animation: "scaleIn 0.6s ease forwards 0.5s",
    transformOrigin: "center",
    opacity: 0,
    transform: "scale(0)",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  message: {
    fontSize: 18,
    fontWeight: 500,
    color: "#555",
    marginBottom: 32,
    lineHeight: 1.6,
  },
  infoCard: {
    display: "flex",
    alignItems: "flex-start",
    padding: 20,
    backgroundColor: "#fff9ec",
    borderRadius: 12,
    marginBottom: 32,
    border: "1px solid #ffe0b2",
    textAlign: "left",
  },
  infoIcon: {
    marginRight: 16,
    marginTop: 2,
    flexShrink: 0,
  },
  infoText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 1.6,
  },
  nextStepsSection: {
    textAlign: "left",
    marginBottom: 32,
  },
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 16,
    color: "#333",
  },
  stepsList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  step: {
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    marginBottom: 12,
    fontSize: 16,
    color: "#555",
    lineHeight: 1.5,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 50,
    backgroundColor: "#f3b664",
    marginRight: 20,
    marginTop: 8,
    flexShrink: 0,
  },
  buttonContainer: {
    marginTop: 32,
    display: "flex",
    justifyContent: "center",
  }
};
