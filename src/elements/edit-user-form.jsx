import "../App.css";
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';
import TextBox from "./text-box";
import InfographicBox from './infographic-box';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const client = new ApolloClient({
    uri: 'https://userservice-production-63de.up.railway.app/graphql',
    cache: new InMemoryCache(),
    credentials: 'include',
});

export default function EditUserForm() {

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
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
            </div>
        );
    }
    if(fetchMyDetailsError)
    {
        console.log("Fetch my details error is:" , fetchMyDetailsError);
        if(fetchMyDetailsError.message === 'Unauthorized')
        {
            return (
                <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                    <div style={{width: 950, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
                </div>
            );
        }
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 950, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
            </div>
        );
    }

    const resultData = fetchMyDetailsData.fetchMyDetails;

    let universityId = resultData.universityId;

    const fullName = resultData.name;
    const firstName = fullName.split(" " , 2)[0];
    const lastName = fullName.split(" " , 2)[1];
    const email = resultData.email;
    const phone = resultData.phoneNumber;

    const data = {
        universityId: universityId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone
    };
    return <EditUserFormChild data={data} />;
}

function EditUserFormChild({data}) {
    const navigate = useNavigate();

    const [universityId, setUniversityId] = useState(data.universityId);
    const [firstName, setFirstName] = useState(data.firstName);
    const [lastName, setLastName] = useState(data.lastName);
    const [email, setEmail] = useState(data.email);
    const [phone, setPhone] = useState(data.phone);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const UPDATE_MY_USER_MUTATION = gql`
    mutation UpdateMyUser($name : String!, $email : String!, $phoneNumber : String!) {
        updateMyUser(name: $name, email: $email, phoneNumber: $phoneNumber) {
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

    const [updateMyUser] = useMutation(UPDATE_MY_USER_MUTATION , {client: client});

    const handleEdit = async () => {

        if(firstName.length === 0 || lastName.length === 0 || email.length === 0 || phone.length === 0)
        {
            setErrorMessage("Please fill in all fields.");
            setError(true);
            return;
        }
        const name = `${firstName} ${lastName}`;
        const data = {name: name, email: email, phoneNumber: phone};
        await updateMyUser({variables: data});
        console.log("Editing user...", data);

        navigate("/dashboard");
    };

    if(!error)
    {
        return (
            <div
                style={{
                width: 900,
                height: 650,
                background: "linear-gradient(#fff, #f0f0f0)",
                borderRadius: 8,
                position: "relative",
                padding: 40,
                margin: "auto",
                marginTop: 100,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}>
                <InfographicBox label="University ID" value={universityId} leftPosition={40} topPosition={50} />
                <TextBox label="First Name" value={firstName} setValue={setFirstName} leftPosition={40} topPosition={130} />
                <TextBox label="Last Name" value={lastName} setValue={setLastName} leftPosition={500} topPosition={130} />
                <TextBox label="Email" value={email} setValue={setEmail} leftPosition={40} topPosition={230} />
                <TextBox label="Phone Number" value={phone} setValue={setPhone} leftPosition={500} topPosition={230} />
                <button
                onClick={handleEdit}
                style={{
                    className: "approve-button",
                    position: "absolute",
                    left: 40,
                    top: 520,
                    width: 890,
                    height: 40,
                    backgroundColor: "rgba(234, 191, 126, 0.91)",
                    border: "none",
                    fontSize: 18,
                    fontWeight: "bold",
                    cursor: "pointer",
                }}
                >
                Edit Profile
                </button>
            </div>
        );
    }
    else
    {
        return (
            <div
                style={{
                width: 900,
                height: 650,
                background: "linear-gradient(#fff, #f0f0f0)",
                borderRadius: 8,
                position: "relative",
                padding: 40,
                margin: "auto",
                marginTop: 100,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}>
                <InfographicBox label="University ID" value={universityId} leftPosition={40} topPosition={50} />
                <TextBox label="First Name" value={firstName} setValue={setFirstName} leftPosition={40} topPosition={130} />
                <TextBox label="Last Name" value={lastName} setValue={setLastName} leftPosition={500} topPosition={130} />
                <TextBox label="Email" value={email} setValue={setEmail} leftPosition={40} topPosition={230} />
                <TextBox label="Phone Number" value={phone} setValue={setPhone} leftPosition={500} topPosition={230} />
                <div style={{width: 890 , height: 40 , left: 40 , top: 480 , position: 'absolute' , color: 'red', fontSize: 25, fontFamily: 'IBM Plex Sans', wordWrap: 'break-word' , border: '0px black solid'}}>
                {errorMessage}
                </div> 
                <button
                onClick={handleEdit}
                style={{
                    className: "approve-button",
                    position: "absolute",
                    left: 40,
                    top: 520,
                    width: 890,
                    height: 40,
                    backgroundColor: "rgba(234, 191, 126, 0.91)",
                    border: "none",
                    fontSize: 18,
                    fontWeight: "bold",
                    cursor: "pointer",
                }}
                >
                Edit Profile
                </button>
            </div>
        );
    }
}