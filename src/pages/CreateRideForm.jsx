import React, { useState, useEffect } from "react";
import {ApolloClient, InMemoryCache, ApolloProvider , gql , useQuery} from "@apollo/client";
import FormBox from "../elements/FormBox";
import FormContainer from "../elements/FormContainer";
import FormRow from "../elements/FormRow";
import FormInput from "../elements/FormInput";
import SubmitButton from "../elements/SubmitButton";
import SuccessRide from "../elements/SuccessRide";

const client = new ApolloClient({
  uri: 'https://userservice-production-63de.up.railway.app/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});

export default function CreateRideForm({ onSuccess }) {
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({
    fromGiu: "from",
    areaName: "",
    time: "",
    girlsOnly: false,
    seats: 4
  });
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdRide, setCreatedRide] = useState(null);

  const FETCH_DETAILS_QUERY = gql`
  query FetchMyDetails{
    fetchMyDetails{
        id
        name
        email
        universityId
        gender
        phoneNumber
        isEmailVerified
        role
        createdAt
        updatedAt
    }
  }`

  const {data : fetchMyDetailsData, loading : fetchMyDetailsLoading, error : fetchMyDetailsError} = useQuery(FETCH_DETAILS_QUERY , {client: client});

  useEffect(() => {
    // Set loading state while fetching
    setLoading(true);
    setError("");
    
    fetch("https://rideservice-production.up.railway.app/ride", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        query: `
          query {
            fetchAllAreas {
              areaName
              basePrice
            }
          }
        `,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        if (data.errors) {
          throw new Error(data.errors[0]?.message || "Error fetching areas");
        }
        setAreas(data.data?.fetchAllAreas || []);
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to load locations: " + err.message);
        console.error("Fetch error:", err);
      });
  }, []);

  useEffect(() => {
    const area = areas.find((a) => a.areaName === form.areaName);
    setPrice(area ? `${area.basePrice} EGP` : "");
  }, [form.areaName, areas]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const isoTime = form.time ? new Date(form.time).toISOString() : "";
    
    fetch("https://rideservice-production.up.railway.app/ride", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        query: `
          mutation {
            createRide(
              time: "${isoTime}",
              areaName: "${form.areaName}",
              fromGiu: ${form.fromGiu === "from"},
              girlsOnly: ${form.girlsOnly}
            ) {
              id
              areaName
              time
              girlsOnly
              basePrice
              seatsLeft
              fromGiu
              driverId
            }
          }
        `,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        if (data.errors) {
          throw new Error(data.errors[0]?.message || "Error creating ride");
        }
        if (data.data && data.data.createRide) {
          setCreatedRide(data.data.createRide);
          setSuccess(true);
          if (onSuccess) onSuccess(data.data.createRide);
        } else {
          throw new Error("No data returned from server");
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to create ride: " + err.message);
        console.error("Submit error:", err);
      });
  }

  if (success && createdRide) {
    return <SuccessRide ride={createdRide} />;
  }

  if(fetchMyDetailsLoading)
  {
    return (
      <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
      </div>
    );
  }

  if(fetchMyDetailsError)
  {
    if(fetchMyDetailsError.message === 'Unauthorized')
    {
      return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
        </div>
      );
    }
    return (
      <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
      </div>
    );
  }

  const user = fetchMyDetailsData.fetchMyDetails;
  const gender = user.gender;

  if(gender !== 'male' && gender !== 'Male')
  {
    return (
      <FormContainer>
        <div style={styles.pageContainer}>
          <h1 style={styles.title}>Create a Ride</h1>
          <FormBox>
            {error && <div style={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <FormRow>
                <label style={styles.label}>Direction</label>
                <select 
                  name="fromGiu" 
                  value={form.fromGiu} 
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="from">From GIU</option>
                  <option value="to">To GIU</option>
                </select>
              </FormRow>
              <FormRow>
                <label style={styles.label}>Location</label>
                <select 
                  name="areaName" 
                  value={form.areaName} 
                  onChange={handleChange} 
                  required
                  style={styles.select}
                  disabled={loading || areas.length === 0}
                >
                  <option value="">Choose Location</option>
                  {areas.map((a) => (
                    <option key={a.areaName} value={a.areaName}>
                      {a.areaName}
                    </option>
                  ))}
                </select>
              </FormRow>
              <FormRow>
                <label style={styles.label}>Departure Time</label>
                <input
                  type="datetime-local"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </FormRow>
              <FormRow>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="girlsOnly"
                    checked={form.girlsOnly}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  Girls-Only Ride
                </label>
              </FormRow>
              <div style={styles.buttonContainer}>
                <SubmitButton label="Create Ride" isSubmitting={loading} />
              </div>
            </form>
          </FormBox>
        </div>
      </FormContainer>
    );
  }
  else
  {
    return (
      <FormContainer>
        <div style={styles.pageContainer}>
          <h1 style={styles.title}>Create a Ride</h1>
          <FormBox>
            {error && <div style={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <FormRow>
                <label style={styles.label}>Direction</label>
                <select 
                  name="fromGiu" 
                  value={form.fromGiu} 
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="from">From GIU</option>
                  <option value="to">To GIU</option>
                </select>
              </FormRow>
              <FormRow>
                <label style={styles.label}>Location</label>
                <select 
                  name="areaName" 
                  value={form.areaName} 
                  onChange={handleChange} 
                  required
                  style={styles.select}
                  disabled={loading || areas.length === 0}
                >
                  <option value="">Choose Location</option>
                  {areas.map((a) => (
                    <option key={a.areaName} value={a.areaName}>
                      {a.areaName}
                    </option>
                  ))}
                </select>
              </FormRow>
              <FormRow>
                <label style={styles.label}>Departure Time</label>
                <input
                  type="datetime-local"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </FormRow>
              <div style={styles.buttonContainer}>
                <SubmitButton label="Create Ride" isSubmitting={loading} />
              </div>
            </form>
          </FormBox>
        </div>
      </FormContainer>
    );
  }
}

const styles = {
  pageContainer: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "40px 20px",
  },
  title: {
    fontWeight: "bold",
    fontSize: 32,
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontWeight: 600,
    marginBottom: 8,
    display: "block",
    color: "#333",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 12,
    transform: "scale(1.2)",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
    color: "#333",
    cursor: "pointer",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  errorMessage: {
    backgroundColor: "#ffeeee",
    color: "#d32f2f",
    padding: "12px 16px",
    borderRadius: 8,
    marginBottom: 16,
    fontWeight: 500,
  }
};
