import React, { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useMutation } from "@apollo/client";
import "../styles/Common.css";
import "../styles/complaint.css";

// Create Apollo Client for Complaints
const complaintsClient = new ApolloClient({
  uri: "https://userservice-production-63de.up.railway.app/graphql", // Ensure correct GraphQL endpoint
  cache: new InMemoryCache(),
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// GraphQL queries and mutations
const GET_COMPLAINTS = gql`
  query {
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
    }
  }
`;

const CREATE_ADMIN_RESPONSE = gql`
  mutation CreateAdminResponse($complaintId: Int!, $Subject: String!, $Message: String!) {
    createAdminResponse(
      complaintId: $complaintId
      Subject: $Subject
      Message: $Message
    ) {
      id
      Subject
      Message
      createdAt
    }
  }
`;

const DELETE_COMPLAINT = gql`
  mutation DeleteComplaint($id: ID!) {
    deleteComplaint(id: $id) {
      id
      Subject
    }
  }
`;

const ResponseForm = ({ complaintId, onResponseSubmitted, onCancel }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [createAdminResponse, { loading }] = useMutation(CREATE_ADMIN_RESPONSE, {
    onCompleted: () => {
      onResponseSubmitted();
    },
    onError: (error) => {
      console.error("Error creating response:", error);
      alert("Failed to submit response. Please try again.");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      alert("Please fill in both subject and message fields");
      return;
    }

    try {
      await createAdminResponse({
        variables: {
          complaintId: parseInt(complaintId, 10),
          Subject: subject,
          Message: message
        },
        refetchQueries: [
          { query: GET_ADMIN_RESPONSES, variables: { complaintId: parseInt(complaintId, 10) } }
        ]
      });
      
      setSubject("");
      setMessage("");
    } catch (err) {
      // Error handled in onError callback
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="subject" className="form-label">Response Subject</label>
        <input
          type="text"
          id="subject"
          className="form-input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter response subject"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="message" className="form-label">Response Message</label>
        <textarea
          id="message"
          className="form-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your response"
          rows={4}
          required
        />
      </div>
      <div className="button-group">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit Response"}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const AdminResponses = ({ complaintId }) => {
  const { loading, error, data } = useQuery(GET_ADMIN_RESPONSES, {
    variables: { complaintId: parseInt(complaintId, 10) },
    fetchPolicy: "network-only"
  });

  if (loading) return <p>Loading responses...</p>;
  if (error) return <p>Error loading responses: {error.message}</p>;

  const responses = data.fetchAdminResponsesByUser || [];

  if (responses.length === 0) {
    return <p>No responses yet</p>;
  }

  return (
    <div className="responses-container">
      <h4>Previous Responses</h4>
      {responses.map(response => (
        <div key={response.id} className="response-card">
          <div className="response-header">
            <h5>{response.Subject}</h5>
            <span className="response-date">{new Date(response.createdAt).toLocaleString()}</span>
          </div>
          <div className="response-body">
            <p>{response.Message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ComplaintsDisplay = ({ setHasData }) => {
  const { loading, error, data, refetch } = useQuery(GET_COMPLAINTS, {
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Error fetching complaints:", error);
      setAuthError(error.message.includes("Unauthorized"));
    }
  });
  
  const [deleteComplaint] = useMutation(DELETE_COMPLAINT, {
    onError: (error) => {
      console.error("Error deleting complaint:", error);
      alert("Failed to delete complaint. Please try again.");
    },
    update: (cache, { data: { deleteComplaint } }) => {
      const existingComplaints = cache.readQuery({ query: GET_COMPLAINTS });
      const newComplaints = existingComplaints.complaints.filter(
        complaint => complaint.id !== deleteComplaint.id
      );
      cache.writeQuery({
        query: GET_COMPLAINTS,
        data: { complaints: newComplaints }
      });
    }
  });
  
  const [authError, setAuthError] = useState(false);
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    if (error?.message.includes("Unauthorized")) {
      setAuthError(true);
      setHasData(false);
    } else {
      setAuthError(false);
    }

    setHasData(data?.complaints?.length > 0);
  }, [data, error, setHasData]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await deleteComplaint({ 
          variables: { id: Number(id) },
          refetchQueries: [{ query: GET_COMPLAINTS }]
        });
      } catch (err) {
        // Error handled in onError callback
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedComplaint(expandedComplaint === id ? null : id);
    setRespondingTo(null); // Close response form when toggling
  };

  const handleRespondClick = (id) => {
    setRespondingTo(id);
  };

  const handleResponseSubmitted = () => {
    setRespondingTo(null);
    // Show success message
    alert("Response submitted successfully");
  };

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
  
  if (authError) return (
    <div className="error-container">
      <div className="error-title">Authentication Error</div>
      <div className="error-message">You are not authorized to view complaints.</div>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-title">Failed to load complaints</div>
      <div className="error-message">{error.message}</div>
      <button 
        onClick={() => refetch()}
        className="btn btn-primary"
        style={{ marginTop: "10px" }}
      >
        Try Again
      </button>
    </div>
  );
  
  if (!data?.complaints || data.complaints.length === 0) return (
    <div className="empty-state">
      <p className="empty-text">No complaints available</p>
    </div>
  );

  return (
    <div className="section-container">
      <div className="section-title">Customer Complaints</div>
      <div className="scrollable-container">
        {data.complaints.map((complaint) => (
          <div key={complaint.id} className="card">
            <div className="complaint-header">
              <div>
                <h3 className="card-title">{complaint.Subject}</h3>
                <p className="complaint-meta">
                  User ID: {complaint.universityId}
                  <span className="complaint-date">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="complaint-actions">
                {expandedComplaint !== complaint.id ? (
                  <button 
                    onClick={() => toggleExpand(complaint.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                  </button>
                ) : (
                  <button 
                    onClick={() => toggleExpand(complaint.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Hide Details
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(complaint.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {expandedComplaint === complaint.id && (
              <div className="complaint-details">
                <div className="complaint-message">
                  <p>{complaint.Message}</p>
                </div>
                
                <div className="complaint-response">
                  <AdminResponses complaintId={complaint.id} />
                  
                  {respondingTo === complaint.id ? (
                    <ResponseForm 
                      complaintId={complaint.id}
                      onResponseSubmitted={handleResponseSubmitted}
                      onCancel={() => setRespondingTo(null)}
                    />
                  ) : (
                    <button 
                      onClick={() => handleRespondClick(complaint.id)}
                      className="btn btn-primary"
                    >
                      Respond to Complaint
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ComplaintManagement = ({ setHasData }) => {
  return (
    <ApolloProvider client={complaintsClient}>
      <div className="main-container">
        <h2 className="main-title">Complaint Management</h2>
        <ComplaintsDisplay setHasData={setHasData} />
      </div>
    </ApolloProvider>
  );
};

export default ComplaintManagement;