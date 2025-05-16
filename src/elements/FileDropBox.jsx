// src/components/FileDropBox.jsx
import React, { useState, useRef } from "react";

export default function FileDropBox({ onFileChange, file, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleClick = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.click();
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(isDragging ? styles.dragging : {}),
        ...(disabled ? styles.disabled : {}),
        ...(file ? styles.hasFile : {})
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        style={{ display: "none" }}
        onChange={(e) => !disabled && e.target.files && onFileChange(e.target.files[0])}
        disabled={disabled}
      />
      
      {file ? (
        <div style={styles.fileInfo}>
          <div style={styles.fileIconContainer}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <circle cx="10" cy="13" r="2"></circle>
              <path d="M10 13v-1.5"></path>
            </svg>
          </div>
          <div style={styles.fileName}>{file.name}</div>
          {!disabled && (
            <button 
              style={styles.removeButton} 
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div style={styles.uploadContent}>
          <div style={styles.iconContainer}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f3b664" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          <div style={styles.uploadText}>
            <span style={styles.dragText}>Drag and drop files</span>
            <span style={styles.orText}>or</span>
            <span style={styles.browseText}>Browse your device</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    border: "1px dashed #ccc",
    borderRadius: 12,
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#fafafa",
    transition: "all 0.2s ease",
    cursor: "pointer",
    minHeight: 120,
  },
  dragging: {
    borderColor: "#f3b664",
    background: "rgba(243, 182, 100, 0.1)",
    boxShadow: "0 0 0 1px rgba(243, 182, 100, 0.3)",
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    background: "#f5f5f5",
  },
  hasFile: {
    borderColor: "#4CAF50",
    background: "rgba(76, 175, 80, 0.05)",
  },
  uploadContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  uploadText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  dragText: {
    color: "#f3b664",
    fontWeight: 600,
    fontSize: 16,
  },
  orText: {
    color: "#666",
    fontSize: 14,
  },
  browseText: {
    color: "#f3b664",
    fontWeight: 600,
    fontSize: 16,
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  fileIconContainer: {
    marginRight: 12,
  },
  fileName: {
    flex: 1,
    color: "#333",
    fontWeight: 500,
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  removeButton: {
    background: "none",
    border: "none",
    color: "#d32f2f",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
};
