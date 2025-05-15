import "../App.css";
import { useState } from "react";
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';
import { useNavigate } from "react-router-dom";
import BigTextBox from "../elements/big-text-box";
import ApproveButton from "../elements/approve-button";

const client  = new ApolloClient({
    uri: 'https://userservice-production-63de.up.railway.app/graphql',
    cache: new InMemoryCache(),
    credentials: 'include',
});

export default function Complaints() {

  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [complaintSubject , setComplaintSubject] = useState("");
  const [complaintDescription , setComplaintDescription] = useState("");

  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

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

  const CREATE_COMPLAINT_MUTATION = gql`
  mutation CreateComplaint($Subject: String!, $Message: String!) {
    createComplaint(Subject: $Subject, Message: $Message) {
        id
        userId
        Subject
        Message
        createdAt
    }
  }`;

  const {data : fetchMyDetailsData, loading : fetchMyDetailsLoading, error : fetchMyDetailsError} = useQuery(FETCH_DETAILS_QUERY , {client: client});
  const [createComplaint, { createComplaintData, createComplaintLoading, createComplaintError }] = useMutation(CREATE_COMPLAINT_MUTATION , {client: client});

  const submitComplaint = () => {
    if(complaintSubject.length === 0 || complaintDescription.length === 0)
    {
      console.log("Failed");
      setErrorMessage("Please fill in all fields.");
      setError(true);
      return;
    }

    createComplaint({ variables: { Subject: complaintSubject , Message: complaintDescription }});
    setSuccess(true);

    setTimeout(() => {
      navigateToDashboard();
    }, 3200);
  };

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
    if(fetchMyDetailsError === 'Unauthorized')
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
  const userId = JSON.stringify(user.universityId);
  

  if(!success)
  {
    if(!error)
    {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <div style={{width: 1000, height: 115, left: '12%', top: 180, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Submit a Complaint</div>
            <div style={{width: 1200, height: 550, top: 220 , left: 210, background: "linear-gradient(#FFFFFF,rgb(255, 239, 209))", borderRadius: 8, position: 'absolute', padding: 40, margin: "auto", marginTop: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.1)"}}>
              <BigTextBox label="Subject" value={complaintSubject} setValue={setComplaintSubject} leftPosition={40} topPosition={40} width={600} height={30} />
              <BigTextBox label="Description" value={complaintDescription} setValue={setComplaintDescription} leftPosition={40} topPosition={110} width={900} height={300} />
              <ApproveButton label={'Submit'} size={'large'} functionToCall={() => {submitComplaint()}} topPosition={520} leftPosition={960}/>
            </div>
        </div>
      );
    }
    else
    {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <div style={{width: 1000, height: 115, left: '12%', top: 180, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Submit a Complaint</div>
            <div style={{width: 1200, height: 550, top: 220 , left: 210, background: "linear-gradient(#FFFFFF,rgb(255, 239, 209))", borderRadius: 8, position: 'absolute', padding: 40, margin: "auto", marginTop: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.1)"}}>
              <BigTextBox label="Subject" value={complaintSubject} setValue={setComplaintSubject} leftPosition={40} topPosition={40} width={600} height={30} />
              <BigTextBox label="Description" value={complaintDescription} setValue={setComplaintDescription} leftPosition={40} topPosition={110} width={900} height={300} />
              <ApproveButton label={'Submit'} size={'large'} functionToCall={() => {submitComplaint()}} topPosition={520} leftPosition={960}/>
              <div style={{width: 890 , height: 40 , left: 40 , top: 480 , position: 'absolute' , color: 'red', fontSize: 25, fontFamily: 'IBM Plex Sans', wordWrap: 'break-word' , border: '0px black solid'}}>
                {errorMessage}
              </div> 
            </div>
        </div>
      );
    }
  }
  else
  {
    return (
          <div style={{ width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 1000, height: 115, left: '12%', top: 180, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Submit a Complaint</div>
            <div style={{width: 1200, height: 550, top: 220 , left: 210, background: "linear-gradient(#FFFFFF,rgb(255, 239, 209))", borderRadius: 8, position: 'absolute', padding: 40, margin: "auto", marginTop: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.1)"}}>
              <div style={{width: 1300 , height: 40 , left: 30 , top: 20 , position: 'absolute' , color: 'black', fontSize: 45, fontFamily: 'IBM Plex Sans', wordWrap: 'break-word' , border: '0px black solid'}}>
                Complaint submitted! An administrator will review it shortly.
              </div>
            </div>
          </div>

    );
  }
}

