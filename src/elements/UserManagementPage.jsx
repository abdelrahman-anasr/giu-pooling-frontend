import React, { useState, useEffect } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  useMutation,
} from "@apollo/client";
import "../styles/UserManagementPage.css";
import Header from "../elements/Header";

// Create Apollo Client for User Management Service
const adminClient = new ApolloClient({
  uri: "https://userservice-production-63de.up.railway.app/graphql",
  cache: new InMemoryCache(),
  credentials: "include", // Important for sending cookies if your auth relies on them
});

// GraphQL Queries and Mutations
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      universityId
      gender
      phoneNumber
      role
      isEmailVerified
      createdAt
    }
  }
`;

// Complaints queries and mutations
const GET_COMPLAINTS = gql`
  query GetComplaints {
    complaints {
      id
      universityId
      Subject
      Message
      createdAt
    }
  }
`;

const GET_ADMIN_RESPONSES = gql`
  query GetAdminResponses($complaintId: Int!) {
    fetchAdminResponsesByUser(complaintId: $complaintId) {
      id
      Subject
      Message
      createdAt
      complaintId
    }
  }
`;

const GET_ALL_ADMIN_RESPONSES = gql`
  query GetAllAdminResponses {
    adminResponses {
      id
      Subject
      Message
      createdAt
      complaintId
    }
  }
`;

const CREATE_ADMIN_RESPONSE = gql`
  mutation CreateAdminResponse(
    $complaintId: Int!
    $Subject: String!
    $Message: String!
  ) {
    createAdminResponse(
      complaintId: $complaintId
      Subject: $Subject
      Message: $Message
    ) {
      id
      Subject
      Message
      createdAt
      complaintId
    }
  }
`;

const DELETE_COMPLAINT = gql`
  mutation DeleteComplaint($id: ID!) {
    deleteComplaint(id: $id) {
      id
      universityId
      Subject
      Message
      createdAt
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser(
    $name: String!
    $email: String!
    $universityId: String!
    $password: String!
    $gender: String!
    $phoneNumber: String
    $role: Role
  ) {
    createUser(
      name: $name
      email: $email
      universityId: $universityId
      password: $password
      gender: $gender
      phoneNumber: $phoneNumber
      role: $role
    ) {
      id
      name
      email
      universityId
      gender
      phoneNumber
      role
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $name: String
    $email: String
    $universityId: String
    $phoneNumber: String
    $role: Role
    $isEmailVerified: Boolean
  ) {
    updateUser(
      id: $id
      name: $name
      email: $email
      universityId: $universityId
      phoneNumber: $phoneNumber
      role: $role
      isEmailVerified: $isEmailVerified
    ) {
      id
      name
      email
      universityId
      gender
      phoneNumber
      role
      isEmailVerified
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

// Account Requests
const GET_ACCOUNT_REQUESTS = gql`
  query GetAccountRequests {
    accountRequests {
      id
      universityId
      name
      email
      gender
      phoneNumber
      createdAt
    }
  }
`;

const ACCEPT_ACCOUNT_REQUEST = gql`
  mutation AcceptAccountRequest($id: Int!) {
    acceptAccountRequest(id: $id) {
      id
      name
      email
      universityId
    }
  }
`;

const REJECT_ACCOUNT_REQUEST = gql`
  mutation RejectAccountRequest($id: Int!) {
    rejectAccountRequest(id: $id) {
      id
      status
    }
  }
`;

// Driver requests queries and mutations
const GET_DRIVER_REQUESTS = gql`
  query GetDriverRequests {
    requests {
      id
      universityId
      status
      createdAt
      reviewedAt
      licenseURL
    }
  }
`;

const ACCEPT_DRIVER_REQUEST = gql`
  mutation AcceptDriverRequest($id: ID!) {
    acceptRequest(id: $id) {
      id
    }
  }
`;

const REJECT_DRIVER_REQUEST = gql`
  query RejectDriverRequest($id: ID!) {
    rejectRequest(id: $id) {
      id
      status
    }
  }
`;

const GET_CARS = gql`
  query GetCars {
    cars {
      id
      DriverId
      carModel
      carModelYear
      seats
    }
  }
`;

// Add this utility function at the top of your component
const formatDate = (dateString) => {
  if (!dateString || dateString === "null") return "-";
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.toLocaleDateString() : "-";
};

// Renaming the original component to UserManagementContent
const UserManagementContent = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [driverRequests, setDriverRequests] = useState([]);
  const [cars, setCars] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [complaintResponses, setComplaintResponses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseFormData, setResponseFormData] = useState({
    subject: "",
    message: "",
  });
  const [currentLicenseURL, setCurrentLicenseURL] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    universityId: "",
    password: "",
    gender: "MALE", // Default, or make it selectable. Changed from 'STUDENT' as gender field
    phoneNumber: "",
    role: "student", // Default role
  });
  const [editFormData, setEditFormData] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [allAdminResponses, setAllAdminResponses] = useState([]);
  const [responseFormGlobal, setResponseFormGlobal] = useState({
    complaintId: "",
    Subject: "",
    Message: "",
  });

  // Users queries and mutations
  const {
    loading: usersLoading,
    error: usersError,
    data: usersData,
    refetch: refetchUsers,
  } = useQuery(GET_USERS, {
    fetchPolicy: "network-only",
    skip: activeTab !== "users",
  });

  // Complaints queries and mutations
  const {
    loading: complaintsLoading,
    error: complaintsError,
    data: complaintsData,
    refetch: refetchComplaints,
  } = useQuery(GET_COMPLAINTS, {
    fetchPolicy: "network-only",
    skip: activeTab !== "complaints",
    onCompleted: (data) => {
      console.log("Complaints query completed successfully:", data);
    },
    onError: (error) => {
      console.error("Complaints query error:", error);
    },
  });

  const {
    loading: responsesLoading,
    error: responsesError,
    data: responsesData,
    refetch: refetchResponses,
  } = useQuery(GET_ADMIN_RESPONSES, {
    variables: {
      complaintId: activeComplaint ? Number(activeComplaint.id) : 0,
    },
    skip: !activeComplaint,
    fetchPolicy: "network-only",
  });

  // Query for all admin responses (not just for one complaint)
  const {
    loading: allResponsesLoading,
    error: allResponsesError,
    data: allResponsesData,
    refetch: refetchAllResponses,
  } = useQuery(GET_ALL_ADMIN_RESPONSES, {
    fetchPolicy: "network-only",
    skip: activeTab !== "adminResponses",
  });

  const [createAdminResponseMutation, { loading: createResponseLoading }] =
    useMutation(CREATE_ADMIN_RESPONSE, {
      onCompleted: () => {
        setShowResponseModal(false);
        refetchResponses();
        setResponseFormData({ subject: "", message: "" });
        alert("Response submitted successfully.");
      },
      onError: (err) => {
        console.error("Create response error:", err);
        alert(`Failed to submit response: ${err.message}`);
      },
    });

  const [deleteComplaintMutation, { loading: deleteComplaintLoading }] =
    useMutation(DELETE_COMPLAINT, {
      onCompleted: (data) => {
        console.log("Complaint successfully deleted:", data);
        refetchComplaints();
        setActiveComplaint(null);
        alert("Complaint deleted successfully.");
      },
      onError: (err) => {
        console.error("Delete complaint error from server:", err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        alert(`Failed to delete complaint: ${err.message}`);
      },
      fetchPolicy: "no-cache", // Ensure we don't use cached data
    });

  const [createUserMutation, { loading: createLoading, error: createError }] =
    useMutation(CREATE_USER, {
      onCompleted: () => {
        refetchUsers();
        setShowCreateModal(false);
        setFormData({
          name: "",
          email: "",
          universityId: "",
          password: "",
          gender: "MALE",
          phoneNumber: "",
          role: "student",
        });
      },
      onError: (err) => alert(`Create user error: ${err.message}`),
    });

  const [updateUserMutation, { loading: updateLoading, error: updateError }] =
    useMutation(UPDATE_USER, {
      onCompleted: () => {
        refetchUsers();
        setShowEditModal(false);
        setEditingUser(null);
      },
      onError: (err) => alert(`Update user error: ${err.message}`),
    });

  const [deleteUserMutation, { loading: deleteLoading, error: deleteError }] =
    useMutation(DELETE_USER, {
      onCompleted: () => {
        refetchUsers();
      },
      // Optimistic update for delete can be tricky, refetch is safer and simpler here.
      // If you want to implement optimistic update, ensure correct cache handling.
      // Example of simple refetch which is already default unless overridden by update fn:
      // refetchQueries: [{ query: GET_USERS }],
      onError: (err) => alert(`Delete user error: ${err.message}`),
    });

  // Account requests query and mutations
  const {
    loading: accountRequestsLoading,
    error: accountRequestsError,
    data: accountRequestsData,
    refetch: refetchAccountRequests,
  } = useQuery(GET_ACCOUNT_REQUESTS, {
    fetchPolicy: "network-only",
    skip: activeTab !== "accountRequests",
  });

  const [acceptAccountRequestMutation, { loading: acceptRequestLoading }] =
    useMutation(ACCEPT_ACCOUNT_REQUEST, {
      onCompleted: () => {
        refetchAccountRequests();
        refetchUsers(); // Refresh users after accepting a request
      },
      onError: (err) => alert(`Accept account request error: ${err.message}`),
    });

  // Setup for reject account request
  const [rejectAccountRequestMutation] = useMutation(REJECT_ACCOUNT_REQUEST, {
    onCompleted: () => {
      refetchAccountRequests();
      alert("Account request rejected successfully.");
    },
    onError: (err) => {
      console.error("Reject account request error:", err);
      alert(`Failed to reject account request: ${err.message}`);
    },
  });

  // Driver requests query and mutations
  const {
    loading: driverRequestsLoading,
    error: driverRequestsError,
    data: driverRequestsData,
    refetch: refetchDriverRequests,
  } = useQuery(GET_DRIVER_REQUESTS, {
    fetchPolicy: "network-only",
    skip: activeTab !== "driverRequests",
  });

  // Cars query
  const {
    loading: carsLoading,
    error: carsError,
    data: carsData,
    refetch: refetchCars,
  } = useQuery(GET_CARS, {
    fetchPolicy: "network-only",
    skip: activeTab !== "driverRequests",
  });

  const [acceptDriverRequestMutation, { loading: acceptDriverRequestLoading }] =
    useMutation(ACCEPT_DRIVER_REQUEST, {
      onCompleted: () => {
        refetchDriverRequests();
        refetchCars();
        alert("Driver request accepted successfully.");
      },
      onError: (err) => {
        console.error("Failed to accept driver request:", err);
        alert(`Failed to accept driver request: ${err.message}`);
      },
    });

  // We're using direct query instead of mutation for reject request
  const [rejectingRequest, setRejectingRequest] = useState(false);

  useEffect(() => {
    if (usersData && activeTab === "users") {
      setUsers(usersData.users);
    }
  }, [usersData, activeTab]);

  useEffect(() => {
    if (accountRequestsData && activeTab === "accountRequests") {
      let accountRequests = [];
      accountRequestsData.accountRequests.forEach((request) => {
        if(request.status === "PENDING") {
          accountRequests.push(request);
        }
      });
      setAccountRequests(accountRequests || []);
    }
  }, [accountRequestsData, activeTab]);

  useEffect(() => {
    if (driverRequestsData && activeTab === "driverRequests") {
      setDriverRequests(driverRequestsData.requests || []);
    }
  }, [driverRequestsData, activeTab]);

  useEffect(() => {
    if (carsData && activeTab === "driverRequests") {
      setCars(carsData.cars || []);
    }
  }, [carsData, activeTab]);

  useEffect(() => {
    if (complaintsData && activeTab === "complaints") {
      console.log("Complaints data received:", complaintsData);
      // Map the complaints and ensure IDs are numbers
      const processedComplaints =
        complaintsData.complaints?.map((complaint) => ({
          ...complaint,
          id: Number(complaint.id), // Ensure ID is a number
        })) || [];

      console.log("Processed complaints:", processedComplaints);
      setComplaints(processedComplaints);
    }
  }, [complaintsData, activeTab]);

  useEffect(() => {
    if (responsesData && activeComplaint) {
      setComplaintResponses(responsesData.fetchAdminResponsesByUser || []);
    }
  }, [responsesData, activeComplaint]);

  useEffect(() => {
    if (allResponsesData && activeTab === "adminResponses") {
      setAllAdminResponses(allResponsesData.adminResponses || []);
    }
  }, [allResponsesData, activeTab]);

  // Handler functions for users
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const { name, email, universityId, password, gender } = formData;
    if (!name || !email || !universityId || !password || !gender) {
      alert(
        "Please fill in all required fields: Name, Email, University ID, Password, Gender."
      );
      return;
    }
    createUserMutation({
      variables: { ...formData, role: formData.role || "student" },
    }); // Ensure role is passed
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      universityId: user.universityId || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "student",
      isEmailVerified: user.isEmailVerified || false,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    const {
      id,
      name,
      email,
      universityId,
      phoneNumber,
      role,
      isEmailVerified,
    } = editFormData;
    if (!name || !email || !universityId) {
      alert("Please fill in all required fields: Name, Email, University ID.");
      return;
    }
    updateUserMutation({
      variables: {
        id,
        name,
        email,
        universityId,
        phoneNumber,
        role,
        isEmailVerified,
      },
    });
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserMutation({ variables: { id: userId } });
      } catch (e) {
        // Error already handled by onError in useMutation
        console.error("Failed to delete user (handleDeleteUser):", e);
      }
    }
  };

  // Handler functions for account requests
  const handleAcceptRequest = async (requestId) => {
    if (
      window.confirm("Are you sure you want to accept this account request?")
    ) {
      try {
        await acceptAccountRequestMutation({
          variables: { id: parseInt(requestId, 10) },
        });
      } catch (e) {
        console.error("Failed to accept account request:", e);
      }
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (
      !window.confirm("Are you sure you want to reject this account request?")
    ) {
      return;
    }

    try {
      await rejectAccountRequestMutation({
        variables: { id: parseInt(requestId, 10) },
      });
    } catch (error) {
      console.error("Failed to reject account request:", error);
      alert(`Failed to reject account request: ${error.message}`);
    }
  };

  // Handler functions for driver requests
  const handleAcceptDriverRequest = async (requestId) => {
    if (
      window.confirm("Are you sure you want to accept this driver request?")
    ) {
      try {
        await acceptDriverRequestMutation({
          variables: { id: requestId },
        });
      } catch (e) {
        console.error("Failed to accept driver request:", e);
      }
    }
  };

  const handleRejectDriverRequest = async (requestId) => {
    if (
      window.confirm("Are you sure you want to reject this driver request?")
    ) {
      try {
        setRejectingRequest(true);
        // Use a query instead of mutation since rejectRequest is defined as a query in the backend
        const result = await adminClient.query({
          query: REJECT_DRIVER_REQUEST,
          variables: { id: requestId },
          fetchPolicy: "no-cache", // Important to ensure we don't get cached results
        });

        if (result.data && result.data.rejectRequest) {
          refetchDriverRequests();
          alert("Driver request rejected successfully.");
        }
      } catch (e) {
        console.error("Failed to reject driver request:", e);
        alert(`Failed to reject driver request: ${e.message}`);
      } finally {
        setRejectingRequest(false);
      }
    }
  };

  const openLicenseModal = (licenseURL) => {
    console.log("Original license URL:", licenseURL);

    // Format the URL correctly, properly handling spaces and special characters
    let fullUrl;

    try {
      // If it's already a full URL
      if (licenseURL.startsWith("http")) {
        fullUrl = licenseURL;
      }
      // If it's a relative URL starting with slash
      else if (licenseURL.startsWith("/")) {
        fullUrl = `http://localhost:4000${licenseURL}`;
      }
      // Any other format
      else {
        fullUrl = `http://localhost:4000/${licenseURL}`;
      }

      // Ensure URL encoding is correct (especially for spaces)
      const url = new URL(fullUrl);
      fullUrl = url.toString();

      console.log("Formatted URL:", fullUrl);
    } catch (error) {
      console.error("Error formatting URL:", error);
      fullUrl = licenseURL; // Use original as fallback
    }

    setCurrentLicenseURL(fullUrl);
    setShowLicenseModal(true);
  };

  // Handler functions for complaint responses
  const handleResponseInputChange = (e) => {
    const { name, value } = e.target;
    setResponseFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateResponse = (e) => {
    e.preventDefault();
    const { subject, message } = responseFormData;
    if (!subject || !message || !activeComplaint) {
      alert("Please fill in all required fields");
      return;
    }
    const complaintId = Number(activeComplaint.id);
    if (isNaN(complaintId)) {
      alert("Invalid complaint ID");
      return;
    }

    console.log(
      "Creating response for complaint ID:",
      complaintId,
      "Type:",
      typeof complaintId
    );

    createAdminResponseMutation({
      variables: {
        complaintId: complaintId,
        Subject: subject,
        Message: message,
      },
    });
  };

  const handleDeleteComplaint = async (complaintId) => {
    const numericId = Number(complaintId);
    if (isNaN(numericId)) {
      alert("Invalid complaint ID");
      return;
    }

    try {
      const response = await deleteComplaintMutation({
        variables: { id: numericId },
        update: (cache) => {
          cache.modify({
            fields: {
              complaints(existingComplaints = [], { readField }) {
                return existingComplaints.filter(
                  (complaintRef) => numericId !== readField("id", complaintRef)
                );
              },
            },
          });
        },
      });

      console.log("Delete response:", response);

      if (activeComplaint && activeComplaint.id === numericId) {
        setActiveComplaint(null);
      }

      refetchComplaints(); // force UI to update just in case
      alert("Complaint deleted successfully.");
    } catch (error) {
      console.error("Delete complaint error:", error);
      alert(`Failed to delete complaint: ${error.message}`);
    }
  };

  const handleViewComplaint = (complaint) => {
    setActiveComplaint(complaint);
    // This will trigger the useEffect that fetches responses
  };

  const handleClearActiveComplaint = () => {
    setActiveComplaint(null);
    setComplaintResponses([]);
  };

  const openResponseModal = (complaint) => {
    setActiveComplaint(complaint);
    setResponseFormData({ subject: "", message: "" });
    setShowResponseModal(true);
  };

  // Handler functions for global admin responses
  const handleGlobalResponseChange = (e) => {
    const { name, value } = e.target;
    setResponseFormGlobal((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateGlobalResponse = async (e) => {
    e.preventDefault();
    const { complaintId, Subject, Message } = responseFormGlobal;

    if (!complaintId || !Subject || !Message) {
      alert("All fields are required");
      return;
    }

    const numericComplaintId = parseInt(complaintId, 10);
    if (isNaN(numericComplaintId)) {
      alert("Complaint ID must be a number");
      return;
    }

    try {
      await createAdminResponseMutation({
        variables: {
          complaintId: numericComplaintId,
          Subject,
          Message,
        },
      });

      // Clear form and refetch
      setResponseFormGlobal({ complaintId: "", Subject: "", Message: "" });
      refetchAllResponses();
      alert("Response submitted successfully.");
    } catch (error) {
      console.error("Create response error:", error);
      alert(`Failed to submit response: ${error.message}`);
    }
  };

  // Render helpers
  const renderUsersList = () => {
    if (usersLoading)
      return <p className="loading-message">Loading users...</p>;
    if (usersError)
      return (
        <p className="error-message">
          Error fetching users: {usersError.message}
        </p>
      );

    return (
      <div className="content-card">
        <div className="section-controls">
          <button
            onClick={() => setShowCreateModal(true)}
            className="add-user-btn"
          >
            Add New User
          </button>
        </div>

        {users.length === 0 ? (
          <div className="empty-table">No users found.</div>
        ) : (
          <table className="data-table users-table">
            <thead>
              <tr>
                <th data-label="ID">ID</th>
                <th data-label="Name">Name</th>
                <th data-label="Email">Email</th>
                <th data-label="University ID">University ID</th>
                <th data-label="Role">Role</th>
                <th data-label="Gender">Gender</th>
                <th data-label="Phone">Phone</th>
                <th data-label="Verified">Verified</th>
                <th data-label="Actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="ID">{user.id}</td>
                  <td data-label="Name">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="University ID">{user.universityId}</td>
                  <td data-label="Role">
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Gender">{user.gender}</td>
                  <td data-label="Phone">{user.phoneNumber || "-"}</td>
                  <td data-label="Verified">
                    <span
                      className={`status-badge ${
                        user.isEmailVerified
                          ? "status-approved"
                          : "status-pending"
                      }`}
                    >
                      {user.isEmailVerified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td data-label="Actions" className="actions-cell">
                    <button
                      onClick={() => openEditModal(user)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteLoading}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {deleteError && (
          <p className="error-message">
            Failed to delete user: {deleteError.message}
          </p>
        )}
      </div>
    );
  };

  const renderAccountRequestsList = () => {
    if (accountRequestsLoading)
      return <p className="loading-message">Loading account requests...</p>;
    if (accountRequestsError)
      return (
        <p className="error-message">
          Error fetching account requests: {accountRequestsError.message}
        </p>
      );

    return (
      <div className="content-card">
        {accountRequests.length === 0 ? (
          <div className="empty-table">No pending account requests.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th data-label="ID">ID</th>
                <th data-label="Name">Name</th>
                <th data-label="Email">Email</th>
                <th data-label="University ID">University ID</th>
                <th data-label="Gender">Gender</th>
                <th data-label="Phone">Phone</th>
                <th data-label="Created At">Created At</th>
                <th data-label="Actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accountRequests.map((request) => (
                <tr key={request.id}>
                  <td data-label="ID">{request.id}</td>
                  <td data-label="Name">{request.name}</td>
                  <td data-label="Email">{request.email}</td>
                  <td data-label="University ID">{request.universityId}</td>
                  <td data-label="Gender">{request.gender}</td>
                  <td data-label="Phone">{request.phoneNumber || "-"}</td>
                  <td data-label="Created At">
                    {formatDate(request.createdAt)}
                  </td>
                  <td data-label="Actions" className="actions-cell">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={acceptRequestLoading}
                      className="accept-button"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="reject-button"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderComplaintsList = () => {
    if (complaintsLoading)
      return <p className="loading-message">Loading complaints...</p>;
    if (complaintsError)
      return (
        <p className="error-message">
          Error fetching complaints: {complaintsError.message}
        </p>
      );

    // If a complaint is selected, show its details and responses
    if (activeComplaint) {
      return (
        <div className="complaint-detail-view">
          <div className="complaint-navigation">
            <button
              onClick={handleClearActiveComplaint}
              className="back-button"
            >
              ← Back to Complaints
            </button>
          </div>

          <div className="content-card">
            <div className="complaint-header">
              <h3>Complaint #{activeComplaint.id}</h3>
              <div className="complaint-actions">
                <button
                  onClick={() => openResponseModal(activeComplaint)}
                  className="primary-button"
                >
                  Respond
                </button>
                <button
                  onClick={() => handleDeleteComplaint(activeComplaint.id)}
                  className="delete-btn"
                  disabled={deleteComplaintLoading}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="complaint-details">
              <div className="detail-row">
                <span className="detail-label">University ID:</span>
                <span className="detail-value">
                  {activeComplaint.universityId}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Subject:</span>
                <span className="detail-value">{activeComplaint.Subject}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">
                  {formatDate(activeComplaint.createdAt)}
                </span>
              </div>
              <div className="complaint-message">
                <h4>Message</h4>
                <div className="message-content">{activeComplaint.Message}</div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h3 className="section-title">Admin Responses</h3>
            {responsesLoading ? (
              <p className="loading-message">Loading responses...</p>
            ) : responsesError ? (
              <p className="error-message">
                Error loading responses: {responsesError.message}
              </p>
            ) : complaintResponses.length === 0 ? (
              <div className="empty-table">No responses yet.</div>
            ) : (
              <div className="responses-list">
                {complaintResponses.map((response) => (
                  <div key={response.id} className="response-card">
                    <div className="response-header">
                      <h4>{response.Subject}</h4>
                      <span className="response-date">
                        {formatDate(response.createdAt)}
                      </span>
                    </div>
                    <div className="response-content">{response.Message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Otherwise, show the list of complaints
    return (
      <div className="content-card">
        <h3 className="section-title">All Complaints</h3>

        {complaints.length === 0 ? (
          <div className="empty-table">No complaints found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th data-label="ID">ID</th>
                <th data-label="University ID">University ID</th>
                <th data-label="Subject">Subject</th>
                <th data-label="Created At">Created At</th>
                <th data-label="Actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td data-label="ID">
                    {complaint.id}
                    <span
                      style={{
                        fontSize: "10px",
                        display: "block",
                        color: "#888",
                      }}
                    >
                      (type: {typeof complaint.id})
                    </span>
                  </td>
                  <td data-label="University ID">{complaint.universityId}</td>
                  <td data-label="Subject">{complaint.Subject}</td>
                  <td data-label="Created At">
                    {formatDate(complaint.createdAt)}
                  </td>
                  <td data-label="Actions" className="actions-cell">
                    <button
                      onClick={() => handleViewComplaint(complaint)}
                      className="view-button"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openResponseModal(complaint)}
                      className="respond-button"
                    >
                      Respond
                    </button>
                    <button
                      onClick={() => handleDeleteComplaint(complaint.id)}
                      className="delete-btn"
                      disabled={deleteComplaintLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderDriverRequestsList = () => {
    if (driverRequestsLoading || carsLoading)
      return <p className="loading-message">Loading driver data...</p>;
    if (driverRequestsError)
      return (
        <p className="error-message">
          Error fetching driver requests: {driverRequestsError.message}
        </p>
      );
    if (carsError)
      return (
        <p className="error-message">
          Error fetching cars: {carsError.message}
        </p>
      );

    // Filter driver requests based on status and search term
    const filteredRequests = driverRequests.filter((request) => {
      const matchesStatus =
        filterStatus === "ALL" || request.status === filterStatus;
      const matchesSearch = request.universityId
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    // Count requests by status
    const pendingCount = driverRequests.filter(
      (r) => r.status === "PENDING"
    ).length;
    const approvedCount = driverRequests.filter(
      (r) => r.status === "APPROVED"
    ).length;
    const rejectedCount = driverRequests.filter(
      (r) => r.status === "REJECTED"
    ).length;

    return (
      <div className="driver-management">
        <div className="content-card">
          <h3 className="section-title">Driver Requests</h3>

          <div className="filter-controls">
            <div className="status-filter">
              <button
                className={`filter-btn ${
                  filterStatus === "ALL" ? "active" : ""
                }`}
                onClick={() => setFilterStatus("ALL")}
              >
                All ({driverRequests.length})
              </button>
              <button
                className={`filter-btn pending ${
                  filterStatus === "PENDING" ? "active" : ""
                }`}
                onClick={() => setFilterStatus("PENDING")}
              >
                Pending ({pendingCount})
              </button>
              <button
                className={`filter-btn approved ${
                  filterStatus === "APPROVED" ? "active" : ""
                }`}
                onClick={() => setFilterStatus("APPROVED")}
              >
                Approved ({approvedCount})
              </button>
              <button
                className={`filter-btn rejected ${
                  filterStatus === "REJECTED" ? "active" : ""
                }`}
                onClick={() => setFilterStatus("REJECTED")}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search by University ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="empty-table">
              No driver requests matching your filters.
            </div>
          ) : (
            <div className="driver-requests-grid">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className={`driver-request-card ${
                    request.status === "PENDING"
                      ? "status-pending"
                      : request.status === "APPROVED"
                      ? "status-approved"
                      : "status-rejected"
                  }`}
                >
                  <div className="request-header">
                    <span className="request-id">Request #{request.id}</span>
                    <span
                      className={`status-badge ${
                        request.status === "PENDING"
                          ? "status-pending"
                          : request.status === "APPROVED"
                          ? "status-approved"
                          : "status-rejected"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="request-details">
                    <div className="detail-row">
                      <span className="detail-label">University ID:</span>
                      <span className="detail-value">
                        {request.universityId}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Submitted:</span>
                      <span className="detail-value">
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                    {request.reviewedAt && (
                      <div className="detail-row">
                        <span className="detail-label">Reviewed:</span>
                        <span className="detail-value">
                          {formatDate(request.reviewedAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="request-actions">
                    {request.licenseURL && (
                      <button
                        onClick={() => openLicenseModal(request.licenseURL)}
                        className="view-license-btn"
                      >
                        View License
                      </button>
                    )}

                    {request.status === "PENDING" && (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleAcceptDriverRequest(request.id)}
                          disabled={acceptDriverRequestLoading}
                          className="accept-button"
                        >
                          Approve Driver
                        </button>
                        <button
                          onClick={() => handleRejectDriverRequest(request.id)}
                          disabled={rejectingRequest}
                          className="reject-button"
                        >
                          Reject Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-card">
          <h3 className="section-title">Approved Drivers & Cars</h3>
          {cars.length === 0 ? (
            <div className="empty-table">No approved cars found.</div>
          ) : (
            <div className="cars-grid">
              {cars.map((car) => (
                <div key={car.id} className="car-card">
                  <div className="car-header">
                    <span className="car-name">
                      {car.carModel} ({car.carModelYear})
                    </span>
                    <span className="seats-badge">{car.seats} seats</span>
                  </div>
                  <div className="car-details">
                    <div className="detail-row">
                      <span className="detail-label">Car ID:</span>
                      <span className="detail-value">{car.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Driver ID:</span>
                      <span className="detail-value">{car.DriverId}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdminResponses = () => {
    if (allResponsesLoading)
      return <p className="loading-message">Loading admin responses...</p>;
    if (allResponsesError)
      return (
        <p className="error-message">
          Error fetching admin responses: {allResponsesError.message}
        </p>
      );

    const formatTimeStamp = (dateString) => {
      if (!dateString || dateString === "null") return "-";
      const date = new Date(dateString);
      return !isNaN(date.getTime())
        ? date.toLocaleDateString() +
            " " +
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "-";
    };

    return (
      <div className="admin-response-manager">
        <div className="content-card">
          <h3 className="section-title">All Admin Responses</h3>

          {allAdminResponses.length === 0 ? (
            <div className="empty-table">No admin responses found.</div>
          ) : (
            <div className="responses-list">
              {allAdminResponses.map((response) => (
                <div key={response.id} className="response-card">
                  <div className="response-header">
                    <h4>{response.Subject}</h4>
                    <span className="response-date">
                      {formatTimeStamp(response.createdAt)}
                    </span>
                  </div>
                  <div className="response-content">
                    <p>{response.Message}</p>
                    <div className="response-meta">
                      <span className="complaint-reference">
                        Complaint ID: {response.complaintId}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-card">
          <h3 className="section-title">Create New Admin Response</h3>
          <form onSubmit={handleCreateGlobalResponse} className="response-form">
            <div className="form-group">
              <label>Complaint ID:</label>
              <input
                type="number"
                name="complaintId"
                value={responseFormGlobal.complaintId}
                onChange={handleGlobalResponseChange}
                required
                placeholder="Enter complaint ID"
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="Subject"
                value={responseFormGlobal.Subject}
                onChange={handleGlobalResponseChange}
                required
                placeholder="Response subject"
              />
            </div>
            <div className="form-group">
              <label>Message:</label>
              <textarea
                name="Message"
                value={responseFormGlobal.Message}
                onChange={handleGlobalResponseChange}
                required
                placeholder="Your response message..."
                rows={6}
              ></textarea>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                disabled={createResponseLoading}
                className="primary-button"
              >
                {createResponseLoading ? "Submitting..." : "Submit Response"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="user-management-page">
      <h1 className="page-title">User Management</h1>
      {/* Tab navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`tab-button ${
            activeTab === "accountRequests" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("accountRequests");
            refetchAccountRequests();
          }}
        >
          Account Requests
        </button>
        <button
          className={`tab-button ${
            activeTab === "driverRequests" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("driverRequests");
            refetchDriverRequests();
            refetchCars();
          }}
        >
          Driver Management
        </button>
        <button
          className={`tab-button ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("complaints");
            setActiveComplaint(null);
            refetchComplaints();
          }}
        >
          Complaints
        </button>
        <button
          className={`tab-button ${
            activeTab === "adminResponses" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("adminResponses");
            refetchAllResponses();
          }}
        >
          Admin Responses
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === "users" && renderUsersList()}
        {activeTab === "accountRequests" && renderAccountRequestsList()}
        {activeTab === "driverRequests" && renderDriverRequestsList()}
        {activeTab === "complaints" && renderComplaintsList()}
        {activeTab === "adminResponses" && renderAdminResponses()}
      </div>

      {/* User creation modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New User</h2>
              <button
                className="close-button"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="user-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>University ID:</label>
                <input
                  type="text"
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender:</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="student">Student</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="primary-button"
                >
                  {createLoading ? "Creating..." : "Create User"}
                </button>
              </div>
              {createError && (
                <p className="error-message">Error: {createError.message}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* User edit modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit User: {editingUser.name}</h2>
              <button
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="user-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>University ID:</label>
                <input
                  type="text"
                  name="universityId"
                  value={editFormData.universityId}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editFormData.phoneNumber}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditInputChange}
                >
                  <option value="student">Student</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isEmailVerified"
                    checked={editFormData.isEmailVerified || false}
                    onChange={handleEditInputChange}
                  />
                  Email Verified
                </label>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="primary-button"
                >
                  {updateLoading ? "Updating..." : "Update User"}
                </button>
              </div>
              {updateError && (
                <p className="error-message">Error: {updateError.message}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* License view modal */}
      {showLicenseModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Driver License</h2>
              <button
                className="close-button"
                onClick={() => setShowLicenseModal(false)}
              >
                ×
              </button>
            </div>
            <div className="license-container">
              {currentLicenseURL ? (
                <>
                  <div className="debug-info">
                    <p>URL: {currentLicenseURL}</p>
                  </div>

                  <div className="license-image-container">
                    <img
                      src={currentLicenseURL}
                      alt="Driver License"
                      className="license-image"
                      onError={(e) => {
                        console.error(
                          "Failed to load image:",
                          currentLicenseURL
                        );
                        e.target.style.display = "none";
                        document.getElementById("license-error").style.display =
                          "block";
                      }}
                    />
                    <div
                      id="license-error"
                      className="license-error"
                      style={{ display: "none" }}
                    >
                      <p>
                        Unable to display image directly due to security
                        restrictions.
                      </p>
                      <a
                        href={currentLicenseURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="download-button"
                      >
                        Open Image in New Tab
                      </a>
                      <p className="error-details">
                        This is a CORS issue. Your browser is preventing
                        cross-origin image loading. The license image is stored
                        on a different domain or port than this application.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-license">No license image available</div>
              )}
            </div>
            <div className="form-actions" style={{ padding: "0 20px 20px" }}>
              <button
                onClick={() => setShowLicenseModal(false)}
                className="secondary-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint response modal */}
      {showResponseModal && activeComplaint && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Respond to Complaint #{activeComplaint.id}</h2>
              <button
                className="close-button"
                onClick={() => setShowResponseModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateResponse} className="response-form">
              <div className="form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  name="subject"
                  value={responseFormData.subject}
                  onChange={handleResponseInputChange}
                  required
                  placeholder="Response subject"
                />
              </div>
              <div className="form-group">
                <label>Message:</label>
                <textarea
                  name="message"
                  value={responseFormData.message}
                  onChange={handleResponseInputChange}
                  required
                  placeholder="Your response to the complaint..."
                  rows={6}
                ></textarea>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowResponseModal(false)}
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createResponseLoading}
                  className="primary-button"
                >
                  {createResponseLoading ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component that wraps with ApolloProvider
const UserManagementPage = () => {
  return (
    <ApolloProvider client={adminClient}>
      <Header />
      <UserManagementContent />
    </ApolloProvider>
  );
};

export default UserManagementPage;
