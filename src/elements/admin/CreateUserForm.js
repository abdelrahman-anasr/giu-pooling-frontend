import React, { useState, useRef, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import "../../styles/Common.css";

// Update CSS for error handling at the beginning of the file
const additionalCSS = `
  input[type='tel'] {
    background: #fff;
    border: 2px solid #222;
    border-radius: 6px;
    padding: 12px 10px;
    font-size: 16px;
    margin-bottom: 18px;
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
    font-family: inherit;
    outline: none;
    box-shadow: none;
    transition: border-color 0.2s;
    display: block;
  }
  
  input[type='tel']:focus {
    border-color: #FFD281;
  }
  
  /* Error Styles */
  .error-field {
    border-color: #D52029 !important;
    background-color: rgba(213, 32, 41, 0.03);
  }
  
  .error-message {
    display: flex;
    align-items: flex-start;
    color: #D52029;
    font-size: 14px;
    margin-top: -12px;
    margin-bottom: 16px;
    animation: slideIn 0.3s ease-out;
  }
  
  .error-icon {
    margin-right: 6px;
    font-size: 14px;
  }
  
  .error-summary {
    background-color: rgba(213, 32, 41, 0.08);
    border: 1px solid rgba(213, 32, 41, 0.3);
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 20px;
    animation: fadeIn 0.5s;
  }
  
  .error-summary-title {
    color: #D52029;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }
  
  .error-summary-list {
    margin: 0;
    padding-left: 25px;
  }
  
  .error-summary-item {
    margin-bottom: 4px;
    cursor: pointer;
  }
  
  .error-summary-item:hover {
    color: #D52029;
    text-decoration: underline;
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }
  
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
    40%, 60% { transform: translate3d(3px, 0, 0); }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser(
    $name: String!,
    $email: String!,
    $universityId: String!,
    $password: String!,
    $gender: String!,
    $phoneNumber: String!,
    $role: Role
  ) {
    createUser(
      name: $name,
      email: $email,
      universityId: $universityId,
      password: $password,
      gender: $gender,
      phoneNumber: $phoneNumber,
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

const roles = [
  { value: "student", label: "Student" },
  { value: "driver", label: "Driver" },
  { value: "admin", label: "Admin" },
];

const genders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

function CreateUserForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    universityId: "",
    password: "",
    gender: "",
    phoneNumber: "",
    role: "student",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState("");
  const [loadingState, setLoadingState] = useState("idle"); // idle, validating, submitting, success, error
  const [createUser, { loading, error }] = useMutation(CREATE_USER);
  
  // Refs for focusing fields
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const universityIdRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const genderRef = useRef(null);
  const roleRef = useRef(null);

  // Add state for submission attempts
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  // Add state for tracking which fields have been touched
  const [touched, setTouched] = useState({});
  
  // Autofocus on name field when component mounts
  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  // Check password strength
  useEffect(() => {
    if (!form.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (form.password.length >= 8) strength += 25;
    else if (form.password.length >= 6) strength += 15;
    
    // Contains lowercase
    if (/[a-z]/.test(form.password)) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(form.password)) strength += 25;
    
    // Contains number
    if (/[0-9]/.test(form.password)) strength += 25;
    
    // Contains special char
    if (/[^A-Za-z0-9]/.test(form.password)) strength += 25;
    
    // Cap at 100
    setPasswordStrength(Math.min(100, strength));
  }, [form.password]);

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format digits into phone number
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number formatting
    if (name === 'phoneNumber') {
      setForm((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    
    // Only validate if the field has been touched already
    if (touched[name]) {
      const newErrors = {...errors};
      
      // Simple validation based on field type
      switch(name) {
        case 'name':
          if (!value.trim()) {
            newErrors.name = "Name is required";
          } else if (value.length < 2) {
            newErrors.name = "Name must be at least 2 characters";
          } else {
            delete newErrors.name;
          }
          break;
          
        case 'email':
          if (!value.trim()) {
            newErrors.email = "Email is required";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newErrors.email = "Please enter a valid email address";
          } else {
            delete newErrors.email;
          }
          break;
          
        case 'universityId':
          if (!value.trim()) {
            newErrors.universityId = "University ID is required";
          } else {
            delete newErrors.universityId;
          }
          break;
          
        case 'password':
          if (!value) {
            newErrors.password = "Password is required";
          } else if (value.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
          } else {
            delete newErrors.password;
          }
          break;
          
        case 'phoneNumber':
          const formattedPhone = formatPhoneNumber(value);
          if (formattedPhone.trim() && !/^[\d\-+]{7,15}$/.test(formattedPhone.replace(/\s/g, ''))) {
            newErrors.phoneNumber = "Please enter a valid phone number";
          } else {
            delete newErrors.phoneNumber;
          }
          break;
          
        case 'gender':
          if (!value) {
            newErrors.gender = "Please select a gender";
          } else {
            delete newErrors.gender;
          }
          break;
          
        case 'role':
          if (!value) {
            newErrors.role = "Please select a role";
          } else {
            delete newErrors.role;
          }
          break;
          
        default:
          break;
      }
      
      setErrors(newErrors);
    }
  };

  // Add handleBlur function to track touched fields
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate this field immediately
    const newErrors = {...errors};
    
    // Field-specific validation
    switch(name) {
      case 'name':
        if (!form.name.trim()) {
          newErrors.name = "Name is required";
        } else if (form.name.length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'email':
        if (!form.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'universityId':
        if (!form.universityId.trim()) {
          newErrors.universityId = "University ID is required";
        } else {
          delete newErrors.universityId;
        }
        break;
        
      case 'password':
        if (!form.password) {
          newErrors.password = "Password is required";
        } else if (form.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'phoneNumber':
        if (form.phoneNumber.trim() && !/^[\d\-+]{7,15}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
          newErrors.phoneNumber = "Please enter a valid phone number";
        } else {
          delete newErrors.phoneNumber;
        }
        break;
        
      case 'gender':
        if (!form.gender) {
          newErrors.gender = "Please select a gender";
        } else {
          delete newErrors.gender;
        }
        break;
        
      case 'role':
        if (!form.role) {
          newErrors.role = "Please select a role";
        } else {
          delete newErrors.role;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    setLoadingState("validating");
    const newErrors = {};
    
    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // University ID validation
    if (!form.universityId.trim()) {
      newErrors.universityId = "University ID is required";
    }
    
    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Phone validation
    if (form.phoneNumber.trim() && !/^[\d\-+]{7,15}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    
    // Gender validation
    if (!form.gender) {
      newErrors.gender = "Please select a gender";
    }
    
    // Role validation
    if (!form.role) {
      newErrors.role = "Please select a role";
    }
    
    setErrors(newErrors);
    setTimeout(() => {
      setLoadingState("idle");
    }, 300);
    return Object.keys(newErrors).length === 0;
  };

  const focusFirstError = (errors) => {
    const fieldRefs = {
      name: nameRef,
      email: emailRef,
      universityId: universityIdRef,
      password: passwordRef,
      phoneNumber: phoneNumberRef,
      gender: genderRef,
      role: roleRef
    };
    
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField && fieldRefs[firstErrorField].current) {
      fieldRefs[firstErrorField].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionAttempted(true);
    
    // Validate all fields
    const isValid = validateForm();
    if (!isValid) {
      focusFirstError(errors);
      return;
    }
    
    try {
      setLoadingState("submitting");
      await createUser({ 
        variables: form,
        refetchQueries: ["users"]
      });
      setLoadingState("success");
      setSuccess(true);
      setForm({
        name: "",
        email: "",
        universityId: "",
        password: "",
        gender: "",
        phoneNumber: "",
        role: "student",
      });
      setErrors({});
      setTimeout(() => {
        setSuccess(false);
        setLoadingState("idle");
        // Return focus to name field for next entry
        if (nameRef.current) {
          nameRef.current.focus();
        }
      }, 5000);
    } catch (err) {
      setLoadingState("error");
      // If there's a GraphQL error, it will be in the error state
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        // Handle specific GraphQL errors
        const graphQLError = err.graphQLErrors[0];
        if (graphQLError.message.includes("email")) {
          setErrors(prev => ({ ...prev, email: "This email is already in use" }));
          emailRef.current.focus();
        } else if (graphQLError.message.includes("universityId")) {
          setErrors(prev => ({ ...prev, universityId: "This University ID is already in use" }));
          universityIdRef.current.focus();
        }
      }
    }
  };

  // Helper component for tooltip
  const Tooltip = ({ content, visible }) => (
    <div 
      style={{
        position: 'absolute',
        top: '-40px',
        left: '0',
        backgroundColor: '#333',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        zIndex: 100,
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }}
    >
      {content}
      <div 
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '15px',
          width: '0',
          height: '0',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #333'
        }}
      />
    </div>
  );

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "#D52029"; // Red
    if (passwordStrength < 60) return "#FFD281"; // Yellow
    return "#5cb85c"; // Green (using a more subdued green that matches the palette better)
  };

  // Error component for consistent styling
  const ErrorMessage = ({ message }) => (
    <div className="error-message" role="alert">
      <span className="error-icon">⚠️</span>
      {message}
    </div>
  );
  
  // Apply visual error state to inputs
  const getInputClassName = (fieldName) => {
    return errors[fieldName] && touched[fieldName] 
      ? "error-field" 
      : "";
  };
  
  // Focus on field and apply shake animation
  const highlightField = (fieldName) => {
    const fieldRefs = {
      name: nameRef,
      email: emailRef,
      universityId: universityIdRef,
      password: passwordRef,
      phoneNumber: phoneNumberRef,
      gender: genderRef,
      role: roleRef
    };
    
    if (fieldRefs[fieldName]?.current) {
      fieldRefs[fieldName].current.focus();
      fieldRefs[fieldName].current.classList.add("shake");
      setTimeout(() => {
        fieldRefs[fieldName].current.classList.remove("shake");
      }, 500);
    }
  };

  return (
    <div className="section-container">
      <div className="section-title">Create New User</div>
      
      {success && (
        <div 
          style={{ 
            backgroundColor: "#5cb85c", 
            color: "white", 
            padding: "10px 15px", 
            borderRadius: "8px", 
            marginBottom: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            animation: "fadeIn 0.3s ease-in-out"
          }}
        >
          <span>✓ User created successfully!</span>
          <button
            onClick={() => setSuccess(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
              padding: "0 5px",
              margin: 0
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {submissionAttempted && Object.keys(errors).length > 0 && (
        <div className="error-summary" role="alert">
          <div className="error-summary-title">
            <span style={{ marginRight: '8px' }}>⚠️</span> 
            Please fix the following errors:
          </div>
          <ul className="error-summary-list">
            {Object.entries(errors).map(([field, message]) => (
              <li 
                key={field} 
                className="error-summary-item"
                onClick={() => highlightField(field)}
              >
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* First row: Name and Email */}
        <div className="form-row">
          <div className="form-col" style={{ position: 'relative' }}>
            <label htmlFor="name">
              Name
              <span 
                style={{ marginLeft: '4px', cursor: 'pointer', color: '#666' }} 
                onMouseEnter={() => setTooltipVisible("name")}
                onMouseLeave={() => setTooltipVisible("")}
              >
                ⓘ
              </span>
            </label>
            {tooltipVisible === "name" && 
              <Tooltip content="Enter user's full name (at least 2 characters)" visible={true} />
            }
            <input
              ref={nameRef}
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("name")}
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && touched.name && (
              <ErrorMessage message={errors.name} id="name-error" />
            )}
          </div>
          <div className="form-col" style={{ position: 'relative' }}>
            <label htmlFor="email">
              Email
              <span 
                style={{ marginLeft: '4px', cursor: 'pointer', color: '#666' }} 
                onMouseEnter={() => setTooltipVisible("email")}
                onMouseLeave={() => setTooltipVisible("")}
              >
                ⓘ
              </span>
            </label>
            {tooltipVisible === "email" && 
              <Tooltip content="Enter a valid email address" visible={true} />
            }
            <input
              ref={emailRef}
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("email")}
              style={{
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: errors.email ? "0 0 0 1px #D52029" : "none"
              }}
            />
            {errors.email && touched.email && (
              <div 
                style={{ 
                  color: "#D52029", 
                  fontSize: "14px", 
                  marginTop: "-12px", 
                  marginBottom: "12px",
                  animation: "fadeIn 0.3s"
                }}
              >
                {errors.email}
              </div>
            )}
          </div>
        </div>

        {/* Second row: University ID and Phone */}
        <div className="form-row">
          <div className="form-col" style={{ position: 'relative' }}>
            <label htmlFor="universityId">
              University ID
              <span 
                style={{ marginLeft: '4px', cursor: 'pointer', color: '#666' }} 
                onMouseEnter={() => setTooltipVisible("universityId")}
                onMouseLeave={() => setTooltipVisible("")}
              >
                ⓘ
              </span>
            </label>
            {tooltipVisible === "universityId" && 
              <Tooltip content="Enter the university ID number" visible={true} />
            }
            <input
              ref={universityIdRef}
              type="text"
              id="universityId"
              name="universityId"
              value={form.universityId}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("universityId")}
              style={{
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: errors.universityId ? "0 0 0 1px #D52029" : "none"
              }}
            />
            {errors.universityId && touched.universityId && (
              <div 
                style={{ 
                  color: "#D52029", 
                  fontSize: "14px", 
                  marginTop: "-12px", 
                  marginBottom: "12px",
                  animation: "fadeIn 0.3s"
                }}
              >
                {errors.universityId}
              </div>
            )}
          </div>
          <div className="form-col" style={{ position: 'relative' }}>
            <label htmlFor="phoneNumber">
              Phone Number (Optional)
              <span 
                style={{ marginLeft: '4px', cursor: 'pointer', color: '#666' }} 
                onMouseEnter={() => setTooltipVisible("phone")}
                onMouseLeave={() => setTooltipVisible("")}
              >
                ⓘ
              </span>
            </label>
            {tooltipVisible === "phone" && 
              <Tooltip content="Optional. Format: XXX-XXX-XXXX" visible={true} />
            }
            <input
              ref={phoneNumberRef}
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="XXX-XXX-XXXX"
              className={`tel-input ${getInputClassName("phoneNumber")}`}
            />
            {errors.phoneNumber && touched.phoneNumber && (
              <div 
                style={{ 
                  color: "#D52029", 
                  fontSize: "14px", 
                  marginTop: "-12px", 
                  marginBottom: "12px",
                  animation: "fadeIn 0.3s"
                }}
              >
                {errors.phoneNumber}
              </div>
            )}
          </div>
        </div>

        {/* Third row: Password, Gender, and Role */}
        <div className="form-row">
          <div className="form-col" style={{ position: 'relative' }}>
            <label htmlFor="password">
              Password
              <span 
                style={{ marginLeft: '4px', cursor: 'pointer', color: '#666' }} 
                onMouseEnter={() => setTooltipVisible("password")}
                onMouseLeave={() => setTooltipVisible("")}
              >
                ⓘ
              </span>
            </label>
            {tooltipVisible === "password" && 
              <Tooltip content="Min 6 chars, mix letters, numbers & symbols" visible={true} />
            }
            <div style={{ position: 'relative' }}>
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={getInputClassName("password")}
                style={{
                  paddingRight: '40px',
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxShadow: errors.password ? "0 0 0 1px #D52029" : "none"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  margin: 0,
                  color: '#555'
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            
            {/* Password strength meter */}
            {form.password && (
              <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                <div style={{ 
                  height: '5px', 
                  background: '#eee', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  marginBottom: '4px'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${passwordStrength}%`, 
                    background: getPasswordStrengthColor(),
                    transition: 'width 0.3s, background-color 0.3s'
                  }} />
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: getPasswordStrengthColor(),
                  textAlign: 'right'
                }}>
                  {passwordStrength < 30 && "Weak"}
                  {passwordStrength >= 30 && passwordStrength < 60 && "Medium"}
                  {passwordStrength >= 60 && "Strong"}
                </div>
              </div>
            )}
            
            {errors.password && touched.password && (
              <div 
                style={{ 
                  color: "#D52029", 
                  fontSize: "14px", 
                  marginTop: "-4px", 
                  marginBottom: "12px",
                  animation: "fadeIn 0.3s"
                }}
              >
                {errors.password}
              </div>
            )}
          </div>
          <div className="form-col" style={{ position: 'relative' }}>
            <label htmlFor="gender">
              Gender
              <span 
                style={{ marginLeft: '4px', cursor: 'pointer', color: '#666' }} 
                onMouseEnter={() => setTooltipVisible("gender")}
                onMouseLeave={() => setTooltipVisible("")}
              >
                ⓘ
              </span>
            </label>
            {tooltipVisible === "gender" && 
              <Tooltip content="Select the user's gender" visible={true} />
            }
            <select
              ref={genderRef}
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("gender")}
              style={{
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: errors.gender ? "0 0 0 1px #D52029" : "none"
              }}
            >
              <option value="" disabled>Select gender</option>
              {genders.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.gender && touched.gender && (
              <div 
                style={{ 
                  color: "#D52029", 
                  fontSize: "14px", 
                  marginTop: "-12px", 
                  marginBottom: "12px",
                  animation: "fadeIn 0.3s"
                }}
              >
                {errors.gender}
              </div>
            )}
          </div>
          <div className="form-col" style={{ position: 'relative' }}>
            <label htmlFor="role">
              Role
              <span 
                style={{ marginLeft: '4px', cursor: 'pointer', color: '#666' }} 
                onMouseEnter={() => setTooltipVisible("role")}
                onMouseLeave={() => setTooltipVisible("")}
              >
                ⓘ
              </span>
            </label>
            {tooltipVisible === "role" && 
              <Tooltip content="Select the user's system role" visible={true} />
            }
            <select
              ref={roleRef}
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("role")}
              style={{
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: errors.role ? "0 0 0 1px #D52029" : "none"
              }}
            >
              <option value="" disabled>Select role</option>
              {roles.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.role && touched.role && (
              <div 
                style={{ 
                  color: "#D52029", 
                  fontSize: "14px", 
                  marginTop: "-12px", 
                  marginBottom: "12px",
                  animation: "fadeIn 0.3s"
                }}
              >
                {errors.role}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div 
            style={{ 
              color: "#D52029", 
              marginBottom: "15px", 
              textAlign: "center",
              padding: "10px",
              background: "rgba(213, 32, 41, 0.1)",
              borderRadius: "5px",
              animation: "fadeIn 0.3s"
            }}
          >
            Error creating user: {error.message}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || loadingState === "submitting"}
            style={{ 
              width: "200px",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s"
            }}
          >
            {loadingState === "submitting" ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <svg className="animate-spin" style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              "Create User"
            )}
          </button>
          
          {/* Clear form button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setForm({
                name: "",
                email: "",
                universityId: "",
                password: "",
                gender: "",
                phoneNumber: "",
                role: "student",
              });
              setErrors({});
              nameRef.current.focus();
            }}
            style={{ 
              width: "200px",
              marginLeft: "10px",
              marginTop: "0"
            }}
          >
            Clear Form
          </button>
        </div>
      </form>
      
      {/* Add CSS animations and additional styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        ${additionalCSS}
      `}</style>
    </div>
  );
}

export default CreateUserForm;
