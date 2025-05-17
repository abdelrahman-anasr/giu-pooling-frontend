import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route } from 'react-router-dom';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import Dashboard from './pages/Dashboard';
import Navbar from './elements/navbar';
import BookSearch from './pages/BookSearch';
import Home from './pages/Home';
import Results from './pages/Results';
import BookingPage from './pages/BookingPage';
import Login from './pages/Login';
import Register from './pages/register';
import Complaints from './pages/Complaints';
import ComplaintsSubmit from './pages/ComplaintsSubmit';
import Notification from './pages/Notification';
import CreateRideForm from './pages/CreateRideForm';
import DriverRegistrationForm from './pages/DriverRegistrationForm';
import VerifyAccount from './pages/verifyAccount';
export default function App() {
  console.log("version is:" , React.version);
  return (
    <div>

      <Navbar />
      <Routes>
        <Route index element={<Home />} />
        <Route path="*" element={<h1 style={{top: 2000}}>404</h1>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookSearch />} />
        <Route path="/search" element={<Results />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/complaints' element={<Complaints />} />
        <Route path='/notifications' element={<Notification />} />
        <Route path='/submitcomplaints' element={<ComplaintsSubmit />} />
        <Route path='/driverregistration' element={<DriverRegistrationForm />} />
        <Route path='/createride' element={<CreateRideForm />} />
        <Route path='/verify-account' element={<VerifyAccount />} />
        
      </Routes>
    </div>
  );
}
 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
      <App />
  </BrowserRouter>

);