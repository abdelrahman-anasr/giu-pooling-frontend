// src/components/FormBox.jsx
import React from "react";

export default function FormBox({ children, onSubmit }) {
  return (
    <div style={styles.formBox}>
      {onSubmit ? (
        <form onSubmit={onSubmit}>{children}</form>
      ) : (
        children
      )}
    </div>
  );
}

const styles = {
  formBox: {
    background: "#fff",
    maxWidth: 640,
    width: "100%",
    margin: "20px auto 40px",
    padding: 32,
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    border: "1px solid #f0f0f0",
  },
};
