import React, { useEffect, useState } from "react";
import FormContainer from "../elements/FormContainer";
import FormBox from "../elements/FormBox";
import FormRow from "../elements/FormRow";
import FormInput from "../elements/FormInput";
import FileDropBox from "../elements/FileDropBox";
import SubmitButton from "../elements/SubmitButton";
import SuccessMessage from "../elements/SuccessMessage";

const ENDPOINT = "https://userservice-production-63de.up.railway.app/graphql";

export default function DriverRegistrationForm() {
  const [universityId, setUniversityId] = useState(null);
  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carModelYear, setCarModelYear] = useState("");
  const [seats, setSeats] = useState("4");
  const [licenseFile, setLicenseFile] = useState(null);
  const [carLicenseFile, setCarLicenseFile] = useState(null);
  const [status, setStatus] = useState("form");
  const [error, setError] = useState("");

  // Fetch universityId when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const query = `
        query {
          fetchMyDetails {
            universityId
          }
        }
      `;

      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query }),
        });

        const data = await res.json();
        const id = data?.data?.fetchMyDetails?.universityId;
        if (id) setUniversityId(id);
        else {
          setStatus("error");
          setError("Could not fetch your university ID. Please try again later.");
        }
      } catch (error) {
        console.error("Failed to fetch universityId:", error);
        setStatus("error");
        setError("Network error. Please check your connection and try again.");
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    if (!carBrand.trim() || !carModel.trim() || !carModelYear.trim()) {
      setStatus("error");
      setError("Please fill in all required fields.");
      return;
    }

    const query = `
  mutation CreateRequest(
    $universityId: String!
    $file: Upload
    $carModel: String!
    $carModelYear: String!
    $seats: Int!
  ) {
    createRequest(
      universityId: $universityId
      file: $file
      carModel: $carModel
      carModelYear: $carModelYear
      seats: $seats
    ) {
      id
      status
    }
  }
`;

const variables = {
  universityId,
  file: null,
  carModel: `${carBrand} ${carModel}`,
  carModelYear,
  seats: parseInt(seats, 10),
};


    const formData = new FormData();
    formData.append("operations", JSON.stringify({ query, variables }));
    formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
    
    if (licenseFile) {
      formData.append("0", licenseFile);
    } else {
      setStatus("error");
      setError("Driver's license file is required.");
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (data?.data?.createRequest) {
        setStatus("submitted");
      } else {
        console.error("GraphQL error:", data);
        setStatus("error");
        setError(data?.errors?.[0]?.message || "Application submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setStatus("error");
      setError("Network error. Please check your connection and try again.");
    }
  };

  if (status === "submitted") {
    return <SuccessMessage />;
  }

  if (!universityId && status !== "error") {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingIndicator}></div>
        <div style={styles.loadingText}>Loading your details...</div>
      </div>
    );
  }

  return (
    <FormContainer>
      <div style={styles.pageContainer}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Driver Registration</h1>
          <p style={styles.subtitle}>Provide your vehicle details to start offering rides</p>
        </div>
        
        <FormBox>
          {status === "error" && (
            <div style={styles.errorMessage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Vehicle Information</h3>
              
              <FormRow withColumns={true}>
                <FormInput
                  label="Car Brand"
                  value={carBrand}
                  setValue={setCarBrand}
                  required={true}
                  placeholder="e.g., Toyota, Honda, BMW"
                />
                <FormInput
                  label="Car Model"
                  value={carModel}
                  setValue={setCarModel}
                  required={true}
                  placeholder="e.g., Camry, Civic, X5"
                />
              </FormRow>

              <FormRow withColumns={true}>
                <FormInput
                  label="Car Model Year"
                  value={carModelYear}
                  setValue={setCarModelYear}
                  required={true}
                  placeholder="e.g., 2020"
                  type="number"
                  min="2000"
                  max="2024"
                />
                <FormInput
                  label="Number of Seats"
                  value={seats}
                  setValue={setSeats}
                  required={true}
                  type="number"
                  min="1"
                  max="7"
                  placeholder="1-7"
                />
              </FormRow>
            </div>

            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Required Documents</h3>
              <p style={styles.sectionDescription}>
                Please upload clear, readable images of your documents
              </p>
              
              <div style={styles.dropboxContainer}>
                <label style={styles.label}>
                  Driver's License
                  <span style={styles.required}>*</span>
                </label>
                <FileDropBox file={licenseFile} onFileChange={setLicenseFile} />
                {!licenseFile && status === "error" && (
                  <div style={styles.fieldError}>Driver's license is required</div>
                )}
              </div>

              <div style={styles.dropboxContainer}>
                <label style={styles.label}>
                  Car License (optional)
                </label>
                <FileDropBox
                  file={carLicenseFile}
                  onFileChange={setCarLicenseFile}
                />
              </div>
            </div>

            <div style={styles.submitContainer}>
              <SubmitButton
                label="Submit Application"
                isSubmitting={status === "submitting"}
              />
            </div>
          </form>
        </FormBox>
      </div>
    </FormContainer>
  );
}

const styles = {
  pageContainer: {
    maxWidth: 700,
    width: "100%",
    margin: "0 auto",
    padding: "20px",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    fontWeight: 400,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#333",
    marginBottom: 12,
    borderBottom: "2px solid #f3b664",
    paddingBottom: 8,
    display: "inline-block",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  submitContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 32,
  },
  errorMessage: {
    backgroundColor: "#ffeeee",
    color: "#d32f2f",
    padding: "12px 16px",
    borderRadius: 8,
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  fieldError: {
    color: "#d32f2f",
    fontSize: 14,
    marginTop: 4,
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
  dropboxContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 60px)",
    background: "linear-gradient(135deg, #f7efe5 0%, #f0f0f0 100%)",
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #f3b664",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    fontWeight: 500,
  },
};
