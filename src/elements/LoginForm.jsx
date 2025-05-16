import React, { useState, } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, gql, ApolloClient, InMemoryCache, ApolloProvider, useLazyQuery } from "@apollo/client";
import { useNavigate } from 'react-router-dom';

const client = new ApolloClient({
  uri: "https://userservice-production-63de.up.railway.app/graphql",
    cache: new InMemoryCache(),
    credentials: 'include',
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

const LoginForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    }`;

    const [fetchMyDetails , {data : fetchMyDetailsData, loading : fetchMyDetailsLoading, error : fetchMyDetailsError}] = useLazyQuery(FETCH_DETAILS_QUERY , {client: client});

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
        }
      }
    `;





    const variables = { email, password };

    try {
      const response = await fetch('https://userservice-production-63de.up.railway.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();

      if(!result.data?.login?.token)
      {
        setError(result.errors?.[0]?.message || 'Login failed');
        return;
      }
      else
      {
        localStorage.setItem('token', result.data.login.token);
      }

      setTimeout(async () => {

          if(role === "admin")
          {
            navigate('/admindashboard');
            window.location.reload();
            localStorage.setItem('token', result.data.login.token);
          }
          else
          {
            navigate('/dashboard');
            window.location.reload();
            localStorage.setItem('token', result.data.login.token);
          }
      }, 1000);
      
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleLogin} style={styles.form}>
      <h2 style={styles.heading}>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={styles.input}
      />
      {error && <p style={styles.error}>{error}</p>}
      <button type="submit" style={styles.button}>Log In</button>

       <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap" />

      <Link to="/register" style={{ textDecoration: 'none', color: '#000', marginTop: '10px' }}>
        Don’t have an account? Register
      </Link>
    </form>
  );
};

const styles = {
 form: {
  width: '100%',
  maxWidth: '887px',
  height: '519px',
  padding: '32px',
  boxSizing: 'border-box',

  display: 'flex',
  flexDirection: 'column',
  gap: '16px',

  border: '1px solid rgba(87, 160, 201, 0.84)',
  borderRadius: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
   marginTop: '100px',
   alignItems: 'center',
}
,
  
  heading: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  input: {
  padding: '12px',
  fontSize: '16px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '80%', // You can adjust this value to control the width of the input
},

  button: {
    padding: '12px',
    backgroundColor: 'rgba(234, 191, 126, 0.91)',
    color: '#fff',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  
  error: {
    color: 'red',
    textAlign: 'center',
  }
};

export default LoginForm;
