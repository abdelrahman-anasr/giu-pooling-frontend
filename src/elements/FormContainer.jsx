// src/components/FormContainer.jsx
import React from "react";

export default function FormContainer({ children }) {
  return (
    <div style={styles.container}>
      {children}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 60px)",
    background: "linear-gradient(135deg, #f7efe5 0%, #f0f0f0 100%)",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start"
  },
};