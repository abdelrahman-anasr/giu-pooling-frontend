import React from "react";

export default function FormInput({
  label,
  value,
  setValue,
  required = true,
  type = "text",
  placeholder = "",
  name = "",
  onChange,
  disabled = false,
}) {
  const handleChange = (e) => {
    if (setValue) setValue(e.target.value);
    if (onChange) onChange(e);
  };

  return (
    <div style={styles.formGroup}>
      {label && (
        <label style={styles.label}>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>
      )}
      <input
        style={{
          ...styles.input,
          ...(disabled ? styles.disabled : {})
        }}
        type={type}
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        name={name}
        disabled={disabled}
      />
    </div>
  );
}

const styles = {
  formGroup: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 600,
    fontSize: 15,
    color: "#333",
  },
  required: {
    color: "#e53935",
    marginLeft: 4,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 16,
    border: "1px solid #ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    ":focus": {
      borderColor: "#f3b664",
      boxShadow: "0 0 0 3px rgba(243, 182, 100, 0.2)",
    }
  },
  disabled: {
    backgroundColor: "#f9f9f9",
    color: "#666",
    cursor: "not-allowed",
  }
};
