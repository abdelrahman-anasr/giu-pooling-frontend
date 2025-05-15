import { useState } from "react";
import TextBox from "./text-box";
import DropdownForForm from "./Dropdown-form";
import { useNavigate } from "react-router-dom";
export default function RegisterForm() {
  const [universityId, setUniversityId] = useState('');
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [genderOpen, setGenderOpen] = useState(false);
  const [genderItems, setGenderItems] = useState([
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ]);
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate("/");
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setError(true);
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      setError(true);
      return;
    }
    if(universityId.length === 0 || firstName.length === 0 || lastName.length === 0 || email.length === 0 || phone.length === 0 || password.length === 0 || confirmPassword.length === 0 || gender.length === 0)
    {
      setErrorMessage("Please fill in all fields.");
      setError(true);
      return;
    }

    const name = `${firstName} ${lastName}`;
    const mutation = `
      mutation {
        createAccountRequest(
         universityId: ${parseInt(universityId)},
          name: "${name}",
          email: "${email}",
          phoneNumber: "${phone}",
          password: "${password}",
          gender: "${gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : gender === 'male' || gender === 'female' ? gender : ''}"
        ) {
          id
          email
         
        }
      }
    `;
    
    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: mutation }),
    });

    const result = await response.json();

    if (result.errors) {
      setErrorMessage("Request failed: " + result.errors[0].message);
      setError(true);
      return;
    } else {
      setSuccess(true);
    }
  };

  if(!success)
  {
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
          <TextBox label="University ID" value={universityId} setValue={setUniversityId} leftPosition={40} topPosition={0} />
          <TextBox label="First Name" value={firstName} setValue={setFirstName} leftPosition={40} topPosition={100} />
          <TextBox label="Last Name" value={lastName} setValue={setLastName} leftPosition={500} topPosition={100} />
          <TextBox label="Email" value={email} setValue={setEmail} leftPosition={40} topPosition={200} />
          <TextBox label="Phone Number" value={phone} setValue={setPhone} leftPosition={500} topPosition={200} />
          <TextBox label="Password" value={password} setValue={setPassword} leftPosition={40} topPosition={300} />
          <TextBox label="Confirm Password" value={confirmPassword} setValue={setConfirmPassword} leftPosition={500} topPosition={300} />
          <DropdownForForm label="Gender" items={genderItems} value={gender} setValue={setGender} leftPosition={40} topPosition={420} open={genderOpen} setOpen={setGenderOpen} />

          <button
            onClick={handleRegister}
            style={{
              position: "absolute",
              left: 40,
              top: 520,
              width: 890,
              height: 40,
              borderRadius: 8,
              backgroundColor: "rgba(234, 191, 126, 0.91)",
              border: "none",
              fontSize: 18,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Register
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
          <TextBox label="University ID" value={universityId} setValue={setUniversityId} leftPosition={40} topPosition={0} />
          <TextBox label="First Name" value={firstName} setValue={setFirstName} leftPosition={40} topPosition={100} />
          <TextBox label="Last Name" value={lastName} setValue={setLastName} leftPosition={500} topPosition={100} />
          <TextBox label="Email" value={email} setValue={setEmail} leftPosition={40} topPosition={200} />
          <TextBox label="Phone Number" value={phone} setValue={setPhone} leftPosition={500} topPosition={200} />
          <TextBox label="Password" value={password} setValue={setPassword} leftPosition={40} topPosition={300} />
          <TextBox label="Confirm Password" value={confirmPassword} setValue={setConfirmPassword} leftPosition={500} topPosition={300} />
          <DropdownForForm label="Gender" items={genderItems} value={gender} setValue={setGender} leftPosition={40} topPosition={420} open={genderOpen} setOpen={setGenderOpen} />
          <div style={{width: 890 , height: 40 , left: 40 , top: 480 , position: 'absolute' , color: 'red', fontSize: 25, fontFamily: 'IBM Plex Sans', wordWrap: 'break-word' , border: '0px black solid'}}>
            {errorMessage}
          </div> 
          <button
            onClick={handleRegister}
            style={{
              position: "absolute",
              left: 40,
              top: 520,
              width: 890,
              height: 40,
              borderRadius: 8,
              backgroundColor: "rgba(234, 191, 126, 0.91)",
              border: "none",
              fontSize: 18,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>
      );
    }
  }
  else
  {
    return (
      <div style={{width: 900, height: 650, background: "linear-gradient(#fff, #f0f0f0)", borderRadius: 8, position: "relative", padding: 40, margin: "auto", marginTop: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.1)",}}>
        <div style={{width: 840 , height: 40 , left: 70 , top: 150 , position: 'absolute' , color: 'black', fontSize: 45, fontFamily: 'IBM Plex Sans', wordWrap: 'break-word' , border: '0px black solid'}}>
          Account request submitted! Please wait for approval.
        </div>
        <button
          onClick={() => {navigateToHome();}}
          style={{
            position: "absolute",
            left: 40,
            top: 300,
            width: 890,
            height: 40,
            borderRadius: 8,
            backgroundColor: "rgba(234, 191, 126, 0.91)",
            border: "none",
            fontSize: 18,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Go to Home
        </button>
      </div>
    );
  }
}
