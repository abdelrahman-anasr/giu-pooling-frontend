/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "../styles/RideMonitoringPage.css";
import "../styles/shared.css";
import "../styles/BookingsPage.css";
import Header from "../elements/Header";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql,
  useQuery,
  useMutation,
  ApolloProvider,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { toast } from "react-toastify";

// GraphQL Queries and Mutations
const FETCH_ALL_AREAS = gql`
  query {
    fetchAllAreas {
      areaName
      basePrice
      distanceFromGiu
    }
  }
`;

const FETCH_ALL_SUBZONES = gql`
  query {
    fetchAllSubzones {
      subzoneName
      areaName
      subZonePrice
    }
  }
`;

const FETCH_ALL_RIDES = gql`
  query {
    fetchAllRides {
      id
      driverId
      time
      areaName
      basePrice
      seatsLeft
      active
      fromGiu
      girlsOnly
    }
  }
`;

const CREATE_AREA = gql`
  mutation CreateArea(
    $areaName: String!
    $basePrice: Float!
    $distanceFromGiu: Float!
  ) {
    createArea(
      areaName: $areaName
      basePrice: $basePrice
      distanceFromGiu: $distanceFromGiu
    ) {
      areaName
      basePrice
      distanceFromGiu
    }
  }
`;

const UPDATE_AREA = gql`
  mutation UpdateArea(
    $areaName: String!
    $basePrice: Float!
    $distanceFromGiu: Float!
  ) {
    updateArea(
      areaName: $areaName
      basePrice: $basePrice
      distanceFromGiu: $distanceFromGiu
    ) {
      areaName
      basePrice
      distanceFromGiu
    }
  }
`;

const CREATE_SUBZONE = gql`
  mutation CreateSubzone(
    $subzoneName: String!
    $areaName: String!
    $subZonePrice: Float!
  ) {
    createSubzone(
      subzoneName: $subzoneName
      areaName: $areaName
      subZonePrice: $subZonePrice
    ) {
      subzoneName
      areaName
      subZonePrice
    }
  }
`;

const UPDATE_SUBZONE = gql`
  mutation UpdateSubzone(
    $subzoneName: String!
    $areaName: String!
    $subZonePrice: Float!
  ) {
    updateSubzone(
      subzoneName: $subzoneName
      areaName: $areaName
      subZonePrice: $subZonePrice
    ) {
      subzoneName
      areaName
      subZonePrice
    }
  }
`;

// Create the Apollo Client instance
const httpLink = createHttpLink({
  uri: "https://rideservice-production.up.railway.app/ride",
  credentials: "include",
  fetchOptions: {
    mode: "cors",
  },
  // Use a function to ensure token is fresh for each request
  headers: () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }),
});

// Add an error link to better handle errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.log("GraphQL Errors:", graphQLErrors);
  }
  if (networkError) {
    console.log("Network Error:", networkError);
  }
});

const rideClient = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

// Main content component that uses Apollo hooks
const RideMonitoringContent = () => {
  const [activeTab, setActiveTab] = useState("areas");
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showSubzoneModal, setShowSubzoneModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArea, setCurrentArea] = useState({
    areaName: "",
    basePrice: "",
    distanceFromGiu: "",
  });
  const [currentSubzone, setCurrentSubzone] = useState({
    subzoneName: "",
    areaName: "",
    subZonePrice: "",
  });
  const [authError, setAuthError] = useState(false);

  // Query for areas - always fetch areas since we need them for subzones
  const {
    loading: areasLoading,
    error: areasError,
    data: areasData,
    refetch: refetchAreas,
  } = useQuery(FETCH_ALL_AREAS, {
    fetchPolicy: "network-only",
  });

  // Query for subzones
  const {
    loading: subzonesLoading,
    error: subzonesError,
    data: subzonesData,
    refetch: refetchSubzones,
  } = useQuery(FETCH_ALL_SUBZONES, {
    fetchPolicy: "network-only",
    skip: activeTab !== "subzones",
  });

  // Query for rides
  const {
    loading: ridesLoading,
    error: ridesError,
    data: ridesData,
    refetch: refetchRides,
  } = useQuery(FETCH_ALL_RIDES, {
    fetchPolicy: "network-only",
    skip: activeTab !== "rides",
  });

  // Mutations
  const [createArea, { loading: createAreaLoading }] = useMutation(CREATE_AREA);
  const [updateArea, { loading: updateAreaLoading }] = useMutation(UPDATE_AREA);
  const [createSubzone, { loading: createSubzoneLoading }] =
    useMutation(CREATE_SUBZONE);
  const [updateSubzone, { loading: updateSubzoneLoading }] =
    useMutation(UPDATE_SUBZONE);

  // Check for auth errors
  useEffect(() => {
    const hasAuthError =
      (areasError && areasError.message.includes("Unauthorized")) ||
      (subzonesError && subzonesError.message.includes("Unauthorized")) ||
      (ridesError && ridesError.message.includes("Unauthorized"));

    if (hasAuthError) {
      setAuthError(true);
    } else {
      setAuthError(false);
    }
  }, [areasError, subzonesError, ridesError]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "areas") {
      refetchAreas();
    } else if (tab === "subzones") {
      refetchSubzones();
    } else if (tab === "rides") {
      refetchRides();
    }
  };

  // Handle area operations
  const handleAddArea = async () => {
    try {
      if (
        !currentArea.areaName ||
        !currentArea.basePrice ||
        !currentArea.distanceFromGiu
      ) {
        throw new Error("All fields are required");
      }

      await createArea({
        variables: {
          areaName: currentArea.areaName,
          basePrice: parseFloat(currentArea.basePrice),
          distanceFromGiu: parseFloat(currentArea.distanceFromGiu),
        },
      });
      toast.success("Area added successfully!");
      setShowAreaModal(false);
      setCurrentArea({ areaName: "", basePrice: "", distanceFromGiu: "" });
      refetchAreas();
    } catch (error) {
      toast.error("Failed to add area: " + error.message);
    }
  };

  const handleUpdateArea = async () => {
    try {
      if (
        !currentArea.areaName ||
        !currentArea.basePrice ||
        !currentArea.distanceFromGiu
      ) {
        throw new Error("All fields are required");
      }

      await updateArea({
        variables: {
          areaName: currentArea.areaName,
          basePrice: parseFloat(currentArea.basePrice),
          distanceFromGiu: parseFloat(currentArea.distanceFromGiu),
        },
      });
      toast.success("Area updated successfully!");
      setShowAreaModal(false);
      setCurrentArea({ areaName: "", basePrice: "", distanceFromGiu: "" });
      setIsEditing(false);
      refetchAreas();
    } catch (error) {
      toast.error("Failed to update area: " + error.message);
    }
  };

  const handleEditArea = (area) => {
    setCurrentArea({
      areaName: area.areaName,
      basePrice: area.basePrice.toString(),
      distanceFromGiu: area.distanceFromGiu.toString(),
    });
    setIsEditing(true);
    setShowAreaModal(true);
  };

  // Handle subzone operations
  const handleAddSubzone = async () => {
    try {
      if (
        !currentSubzone.subzoneName ||
        !currentSubzone.areaName ||
        !currentSubzone.subZonePrice
      ) {
        throw new Error("All fields are required");
      }

      // Ensure proper parsing of the float value
      const subZonePriceFloat = parseFloat(currentSubzone.subZonePrice);

      // Validate the float value
      if (isNaN(subZonePriceFloat)) {
        throw new Error("Invalid price value. Please enter a valid number.");
      }

      await createSubzone({
        variables: {
          subzoneName: currentSubzone.subzoneName,
          areaName: currentSubzone.areaName,
          subZonePrice: subZonePriceFloat,
        },
      });

      setShowSubzoneModal(false);
      setCurrentSubzone({ subzoneName: "", areaName: "", subZonePrice: "" });
      refetchSubzones();
    } catch (error) {
      toast.error(`Failed to add subzone: ${error.message}`);
    }
  };

  const handleUpdateSubzone = async () => {
    try {
      if (
        !currentSubzone.subzoneName ||
        !currentSubzone.areaName ||
        !currentSubzone.subZonePrice
      ) {
        throw new Error("All fields are required");
      }

      // Ensure proper parsing of the float value
      const subZonePriceFloat = parseFloat(currentSubzone.subZonePrice);

      // Validate the float value
      if (isNaN(subZonePriceFloat)) {
        throw new Error("Invalid price value. Please enter a valid number.");
      }

      await updateSubzone({
        variables: {
          subzoneName: currentSubzone.subzoneName,
          areaName: currentSubzone.areaName,
          subZonePrice: subZonePriceFloat,
        },
      });

      toast.success("Subzone updated successfully!");
      setShowSubzoneModal(false);
      setCurrentSubzone({ subzoneName: "", areaName: "", subZonePrice: "" });
      setIsEditing(false);
      refetchSubzones();
    } catch (error) {
      toast.error(`Failed to update subzone: ${error.message}`);
    }
  };

  const handleEditSubzone = (subzone) => {
    setCurrentSubzone({
      subzoneName: subzone.subzoneName,
      areaName: subzone.areaName,
      subZonePrice: subzone.subZonePrice.toString(),
    });
    setIsEditing(true);
    setShowSubzoneModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle auth errors
  if (authError) {
    return (
      <div className="error-container">
        <div className="error-title">Authentication Error</div>
        <div className="error-message">
          You are not authorized to view this data.
        </div>
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Get data for the active tab
  const areas = areasData?.fetchAllAreas || [];
  const subzones = subzonesData?.fetchAllSubzones || [];
  const rides = ridesData?.fetchAllRides || [];

  // Handle loading state for the active tab
  const isLoading =
    (activeTab === "areas" && areasLoading) ||
    (activeTab === "subzones" && (areasLoading || subzonesLoading)) ||
    (activeTab === "rides" && ridesLoading);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p>Loading data...</p>
      </div>
    );
  }

  // Handle error state for the active tab
  const currentError =
    (activeTab === "areas" && areasError) ||
    (activeTab === "subzones" && (areasError || subzonesError)) ||
    (activeTab === "rides" && ridesError);

  if (currentError && !authError) {
    return (
      <div className="error-container">
        <div className="error-title">Failed to load data</div>
        <div className="error-message">{currentError.message}</div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (activeTab === "areas") refetchAreas();
            else if (activeTab === "subzones") {
              refetchAreas();
              refetchSubzones();
            } else if (activeTab === "rides") refetchRides();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Ride Monitoring</h2>

      <div className="content-card">
        <p>Monitor and manage areas, subzones, and ride details.</p>
        <div className="tabs-container">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === "areas" ? "active" : ""}`}
              onClick={() => handleTabChange("areas")}
            >
              Areas
            </button>
            <button
              className={`tab-button ${
                activeTab === "subzones" ? "active" : ""
              }`}
              onClick={() => handleTabChange("subzones")}
            >
              Subzones
            </button>
            <button
              className={`tab-button ${activeTab === "rides" ? "active" : ""}`}
              onClick={() => handleTabChange("rides")}
            >
              Rides
            </button>
          </div>
          <div className="tab-content">
            {activeTab === "areas" && (
              <div className="areas-section">
                <div className="section-controls">
                  <button
                    className="primary-button"
                    onClick={() => {
                      setCurrentArea({
                        areaName: "",
                        basePrice: "",
                        distanceFromGiu: "",
                      });
                      setIsEditing(false);
                      setShowAreaModal(true);
                    }}
                  >
                    Add New Area
                  </button>
                </div>
                <div className="data-table-placeholder">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Area Name</th>
                        <th>Base Price</th>
                        <th>Distance from GIU</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areas.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="no-data">
                            No areas found. Add a new area to get started.
                          </td>
                        </tr>
                      ) : (
                        areas.map((area) => (
                          <tr key={area.areaName}>
                            <td>{area.areaName}</td>
                            <td>{area.basePrice} EGP</td>
                            <td>{area.distanceFromGiu} km</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="accept-button"
                                  onClick={() => handleEditArea(area)}
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "subzones" && (
              <div className="subzones-section">
                <div className="section-controls">
                  <button
                    className="primary-button"
                    onClick={() => {
                      setCurrentSubzone({
                        subzoneName: "",
                        areaName: "",
                        subZonePrice: "",
                      });
                      setIsEditing(false);
                      setShowSubzoneModal(true);
                    }}
                    disabled={areas.length === 0}
                  >
                    Add New Subzone
                  </button>
                </div>
                <div className="data-table-placeholder">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subzone Name</th>
                        <th>Area Name</th>
                        <th>Subzone Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areas.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="no-data">
                            Please create areas first before adding subzones.
                          </td>
                        </tr>
                      ) : subzones.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="no-data">
                            No subzones found. Add a new subzone to get started.
                          </td>
                        </tr>
                      ) : (
                        subzones.map((subzone) => (
                          <tr key={subzone.subzoneName}>
                            <td>{subzone.subzoneName}</td>
                            <td>{subzone.areaName}</td>
                            <td>{subzone.subZonePrice} EGP</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="accept-button"
                                  onClick={() => handleEditSubzone(subzone)}
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "rides" && (
              <div className="rides-section">
                <div className="data-table-placeholder">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Driver ID</th>
                        <th>Time</th>
                        <th>Area</th>
                        <th>Price</th>
                        <th>Seats Left</th>
                        <th>Status</th>
                        <th>Direction</th>
                        <th>Girls Only</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rides.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="no-data">
                            No rides found.
                          </td>
                        </tr>
                      ) : (
                        rides.map((ride) => (
                          <tr key={ride.id}>
                            <td>{ride.id}</td>
                            <td>{ride.driverId}</td>
                            <td>{formatDate(ride.time)}</td>
                            <td>{ride.areaName}</td>
                            <td>{ride.basePrice} EGP</td>
                            <td>{ride.seatsLeft}</td>
                            <td>
                              <span
                                className={`badge ${
                                  ride.active ? "badge-success" : "badge-danger"
                                }`}
                              >
                                {ride.active ? "Active" : "Completed"}
                              </span>
                            </td>
                            <td>{ride.fromGiu ? "From GIU" : "To GIU"}</td>
                            <td>{ride.girlsOnly ? "Yes" : "No"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Area Modal */}
      {showAreaModal && (
        <div className="modal-overlay" onClick={() => setShowAreaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditing ? "Edit Area" : "Add New Area"}</h3>
              <button
                className="close-button"
                onClick={() => setShowAreaModal(false)}
              >
                ×
              </button>
            </div>
            <div className="form-group">
              <label>Area Name:</label>
              <input
                type="text"
                value={currentArea.areaName}
                onChange={(e) =>
                  setCurrentArea({ ...currentArea, areaName: e.target.value })
                }
                disabled={isEditing}
              />
            </div>
            <div className="form-group">
              <label>Base Price (EGP):</label>
              <input
                type="number"
                value={currentArea.basePrice}
                onChange={(e) =>
                  setCurrentArea({ ...currentArea, basePrice: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Distance from GIU (km):</label>
              <input
                type="number"
                value={currentArea.distanceFromGiu}
                onChange={(e) =>
                  setCurrentArea({
                    ...currentArea,
                    distanceFromGiu: e.target.value,
                  })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                className="primary-button"
                onClick={isEditing ? handleUpdateArea : handleAddArea}
                disabled={createAreaLoading || updateAreaLoading}
              >
                {createAreaLoading || updateAreaLoading
                  ? "Processing..."
                  : isEditing
                  ? "Update"
                  : "Add"}
              </button>
              <button
                className="reject-button"
                onClick={() => setShowAreaModal(false)}
                disabled={createAreaLoading || updateAreaLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subzone Modal */}
      {showSubzoneModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSubzoneModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditing ? "Edit Subzone" : "Add New Subzone"}</h3>
              <button
                className="close-button"
                onClick={() => setShowSubzoneModal(false)}
              >
                ×
              </button>
            </div>
            <div className="form-group">
              <label>Subzone Name:</label>
              <input
                type="text"
                value={currentSubzone.subzoneName}
                onChange={(e) =>
                  setCurrentSubzone({
                    ...currentSubzone,
                    subzoneName: e.target.value,
                  })
                }
                disabled={isEditing}
              />
            </div>
            <div className="form-group">
              <label>Area Name:</label>
              <select
                value={currentSubzone.areaName}
                onChange={(e) =>
                  setCurrentSubzone({
                    ...currentSubzone,
                    areaName: e.target.value,
                  })
                }
              >
                <option value="">Select Area</option>
                {areas.map((area) => (
                  <option key={area.areaName} value={area.areaName}>
                    {area.areaName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Subzone Price (EGP):</label>
              <input
                type="number"
                value={currentSubzone.subZonePrice}
                onChange={(e) =>
                  setCurrentSubzone({
                    ...currentSubzone,
                    subZonePrice: e.target.value,
                  })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                className="primary-button"
                onClick={isEditing ? handleUpdateSubzone : handleAddSubzone}
                disabled={createSubzoneLoading || updateSubzoneLoading}
              >
                {createSubzoneLoading || updateSubzoneLoading
                  ? "Processing..."
                  : isEditing
                  ? "Update"
                  : "Add"}
              </button>
              <button
                className="reject-button"
                onClick={() => setShowSubzoneModal(false)}
                disabled={createSubzoneLoading || updateSubzoneLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap the content with ApolloProvider
const RideMonitoringPage = () => {
  return (
    <ApolloProvider client={rideClient}>
      <Header />
      <RideMonitoringContent />
    </ApolloProvider>
  );
};

export default RideMonitoringPage;
