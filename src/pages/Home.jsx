import "../App.css";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApproveButton from "../elements/approve-button";
import RejectButton from "../elements/reject-button";
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation} from '@apollo/client';

const client  = new ApolloClient({
    uri: 'https://userservice-production-63de.up.railway.app/graphql',
    cache: new InMemoryCache(),
    credentials: 'include',
});
export default function Home() {

  const navigate = useNavigate();

  const loginClick = () => {
      navigate('/login');
  }

  const registerClick = () => {
      navigate('/register');
  }

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

  const {data : fetchMyDetailsData, loading : fetchMyDetailsLoading, error : fetchMyDetailsError} = useQuery(FETCH_DETAILS_QUERY , {client: client});

  if(fetchMyDetailsLoading)
  {
    return (
      <div style={{overflowX: 'clip', width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <img src={require('../images/design.jpg')} style={{width: 1706, height: 800, left: '0%', top: 0, position: 'absolute' , zIndex: -1 , opacity: 0.3}} />
          <div style={{width: '100%', height: '100%', top: 200 , left: 400, position: 'absolute' , zIndex: -0.5 , opacity: 1 , fontSize: 80 , fontFamily: "IBM Plex Sans", fontWeight: 700, color: '#000000'}}>Welcome to</div>
          <img src={require('../images/giu.png')} style={{width: 130, height: 70, left: 860, top: 220, position: 'absolute' , zIndex: -0.5 , opacity: 1}} /> 
          <div style={{width: '100%', height: '100%', top: 200 , left: 1000, position: 'absolute' , zIndex: -0.5 , opacity: 1 , fontSize: 80 , fontFamily: "IBM Plex Sans", fontWeight: 700, color: '#000000'}}>Pooling!</div>
          <div style={{width: '100%', height: '100%', top: 300 , left: 650, position: 'absolute' , zIndex: -0.5 , opacity: 1 , fontSize: 80 , fontFamily: "IBM Plex Sans", fontWeight: 700, color: '#000000'}}>Loading...</div>
      </div>
    );
  }

  if(fetchMyDetailsError)
  {
    return (
      <div style={{overflowX: 'clip', width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <img src={require('../images/design.jpg')} style={{width: 1706, height: 800, left: '0%', top: 0, position: 'absolute' , zIndex: -1 , opacity: 0.3}} />
          <div style={{width: '100%', height: '100%', top: 200 , left: 400, position: 'absolute' , zIndex: -0.5 , opacity: 1 , fontSize: 80 , fontFamily: "IBM Plex Sans", fontWeight: 700, color: '#000000'}}>Welcome to</div>
          <img src={require('../images/giu.png')} style={{width: 130, height: 70, left: 860, top: 220, position: 'absolute' , zIndex: -0.5 , opacity: 1}} /> 
          <div style={{width: '100%', height: '100%', top: 200 , left: 1000, position: 'absolute' , zIndex: -0.5 , opacity: 1 , fontSize: 80 , fontFamily: "IBM Plex Sans", fontWeight: 700, color: '#000000'}}>Pooling!</div>
          <ApproveButton label={'Login'} size={'large'} functionToCall={loginClick} topPosition={330} leftPosition={570}/>
          <RejectButton label={'Register'} size={'large'} functionToCall={registerClick} topPosition={330} leftPosition={850}/>
      </div>
    );
  }
  else
  {
    return (
      <div style={{overflowX: 'clip', width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <img src={require('../images/design.jpg')} style={{width: 1706, height: 800, left: '0%', top: 0, position: 'absolute' , zIndex: -1 , opacity: 0.3}} />
          <div style={{width: '100%', height: '100%', top: 200 , left: 400, position: 'absolute' , zIndex: -0.5 , opacity: 1 , fontSize: 80 , fontFamily: "IBM Plex Sans", fontWeight: 700, color: '#000000'}}>Welcome to</div>
          <img src={require('../images/giu.png')} style={{width: 130, height: 70, left: 860, top: 220, position: 'absolute' , zIndex: -0.5 , opacity: 1}} /> 
          <div style={{width: '100%', height: '100%', top: 200 , left: 1000, position: 'absolute' , zIndex: -0.5 , opacity: 1 , fontSize: 80 , fontFamily: "IBM Plex Sans", fontWeight: 700, color: '#000000'}}>Pooling!</div>
      </div>
    );
  }
}