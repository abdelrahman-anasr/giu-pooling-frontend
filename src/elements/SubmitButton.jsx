// src/components/SubmitButton.jsx
import React from "react";

export default function SubmitButton({ label, isSubmitting }) {
  return (
    <button 
      type="submit" 
      style={{
        ...styles.button,
        ...(isSubmitting ? styles.submitting : {}),
      }} 
      disabled={isSubmitting}
    >
      {isSubmitting ? "Processing..." : label}
    </button>
  );
}

const styles = {
  button: {
    background: "linear-gradient(to right, #f3b664, #ec994b)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "14px 32px",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    marginTop: 20,
    width: "auto",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(243, 182, 100, 0.2)",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(243, 182, 100, 0.4)",
    }
  },
  submitting: {
    opacity: 0.8,
    cursor: "not-allowed",
    background: "#f3b664",
  },
};
