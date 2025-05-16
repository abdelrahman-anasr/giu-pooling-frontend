// src/components/FormRow.jsx
import React from "react";

export default function FormRow({ children, withColumns = false }) {
  return (
    <div style={withColumns ? styles.rowWithColumns : styles.row}>
      {children}
    </div>
  );
}

const styles = {
  row: {
    marginBottom: 20,
    width: "100%",
  },
  rowWithColumns: {
    marginBottom: 20,
    width: "100%",
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
};