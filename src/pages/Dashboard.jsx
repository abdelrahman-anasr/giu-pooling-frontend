import PassengerTripsList from '../elements/passenger-trips-list';
import { act, useEffect } from 'react';
import ChoiceBarCurrentBooking from '../elements/choice-bar-current-booking'
import ScrollableOffersList from '../elements/offers-list'
import ScrollableDriverTripsList from '../elements/driver-trip-list'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';
import '../App.css';
import AdminDashboard from './AdminDashboard';
import ApproveButton from '../elements/approve-button';


const DashboardPage = () => {

  const navigate = useNavigate();
  const [isTripStatusSelected, setIsTripStatusSelected] = useState(true);
  const [isCurrentOffers , setIsCurrentOffers] = useState(true);

  useEffect(() => {
    console.log("New value is: " + isTripStatusSelected);
  }, [isTripStatusSelected , isCurrentOffers]);

  function handleTripStatusSelected(newValue) {
    setIsTripStatusSelected(newValue);
  }

  function handleCurrentOffers(newValue) {
    setIsCurrentOffers(newValue);
  }

  let tripsOfDriver = [];

  let tripsOfPassenger = [];

  let activeTripsOfPassenger = [];

  let offers = [
  ];



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

  const FETCH_BOOKINGS_QUERY = gql`
  query FetchMyBookings {
    fetchMyBookings {
        id
        studentId
        rideId
        status
        price
    }
  }`

  const FETCH_REQUESTS_QUERY = gql`
  query FetchMyRequests {
    fetchMyRequests {
        id
        studentId
        rideId
        status
        price
    }
  }
  `;

  const FETCH_ALL_RIDES_QUERY = gql`
  query FetchAllRides {
    fetchAllRides {
        id
        driverId
        time
        areaName
        basePrice
        seatsLeft
        active
        fromGiu
        girlsOnly
    }
  }`;

  const FETCH_ALL_CARS_QUERY = gql`
  query Cars {
    cars {
        id
        DriverId
        carModel
        carModelYear
        seats
    }
  }
  `;

  const CANCEL_BOOKING_QUERY = gql`
  query CancelBooking($id: Int!) {
    cancelBooking(id: $id) {
      id
      studentId
      rideId
      status
      price
    }
  }`;

  const CANCEL_REQUEST_QUERY = gql`
  query CancelRequest($id: Int!) {
    cancelRequest(id: $id) {
      id
      studentId
      rideId
      status
      price
    }
  }`;

  const MINI_USERS_QUERY = gql`
  query Miniusers {
    Miniusers {
        universityId
        name
    }
  }`;

  const FETCH_MY_RIDES_QUERY = gql`
  query FetchMyRides {
    fetchMyRides {
        id
        driverId
        time
        areaName
        basePrice
        seatsLeft
        active
        fromGiu
        girlsOnly
    }
  }`;

  const CANCEL_RIDE_MUTATION = gql`
  mutation CancelRide($id: Int!) {
    cancelRide(id: $id) {
        id
        driverId
        time
        areaName
        basePrice
        seatsLeft
        active
        fromGiu
        girlsOnly
    }
  }`;

  const FETCH_REQUESTS_FOR_MY_RIDES_QUERY = gql`
  query FetchRequestsForAllMyRides {
    fetchRequestsForAllMyRides {
        id
        studentId
        rideId
        status
        subZoneName
        price
    }
  }
  `;

  const REJECT_REQUEST_QUERY = gql`
    query RejectRequest($id: Int!) {
      rejectRequest(id: $id) {
        id
        studentId
        rideId
        status
        subZoneName
        price
      }
    }
  `;

  const ACCEPT_REQUEST_MUTATON = gql`
    mutation AcceptRequest($id: Int!) {
      acceptRequest(id: $id) {
        id
        studentId
        rideId
        status
        price
      }
    }`;


  const {data : fetchMyDetailsData, loading : fetchMyDetailsLoading, error : fetchMyDetailsError} = useQuery(FETCH_DETAILS_QUERY , {client: client});

  const {data : fetchAllCarsData, loading : fetchAllCarsLoading, error : fetchAllCarsError} = useQuery(FETCH_ALL_CARS_QUERY , {client: client});

  const {data : fetchMyBookingsData, loading : fetchMyBookingsLoading, error : fetchMyBookingsError} = useQuery(FETCH_BOOKINGS_QUERY , {client: bookingClient});

  const {data : fetchMyRequestsData, loading : fetchMyRequestsLoading, error : fetchMyRequestsError} = useQuery(FETCH_REQUESTS_QUERY , {client: bookingClient});

  const {data : fetchMiniUsersData, loading : fetchMiniUsersLoading, error : fetchMiniUsersError} = useQuery(MINI_USERS_QUERY , {client: client});

  const {data : fetchAllRidesData, loading : fetchAllRidesLoading, error : fetchAllRidesError} = useQuery(FETCH_ALL_RIDES_QUERY , {client: rideClient});

  const {data : fetchMyRidesData, loading : fetchMyRidesLoading, error : fetchMyRidesError} = useQuery(FETCH_MY_RIDES_QUERY , {client: rideClient});

  const {data : fetchRequestsForAllMyRidesData, loading : fetchRequestsForAllMyRidesLoading, error : fetchRequestsForAllMyRidesError} = useQuery(FETCH_REQUESTS_FOR_MY_RIDES_QUERY , {client: bookingClient});

  const [cancelBooking, { cancelBookingData, cancelBookingLoading, cancelBookingError }] =  useLazyQuery(CANCEL_BOOKING_QUERY , {client: bookingClient});

  const [cancelRequest, { cancelRequestData, cancelRequestLoading, cancelRequestError }] =  useLazyQuery(CANCEL_REQUEST_QUERY , {client: bookingClient});

  const [rejectRequest, { rejectRequestData, rejectRequestLoading, rejectRequestError }] =  useLazyQuery(REJECT_REQUEST_QUERY , {client: bookingClient});

  const [cancelRide , { cancelRideData , cancelRideLoading , cancelRideError }] = useMutation(CANCEL_RIDE_MUTATION , {client: rideClient});

  const [acceptRequest , { acceptRequestData , acceptRequestLoading , acceptRequestError }] = useMutation(ACCEPT_REQUEST_MUTATON , {client: bookingClient});


  if(fetchAllRidesLoading || fetchMyDetailsLoading || fetchMyBookingsLoading || fetchMyRequestsLoading || fetchAllRidesLoading || fetchAllCarsLoading || fetchMiniUsersLoading)
  {
    return (
      <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
      </div>
    );
  }

  if(fetchAllRidesError || fetchMyDetailsError || fetchMyBookingsError || fetchMyRequestsError || fetchAllRidesError || fetchAllCarsError || fetchMiniUsersError)
  {
    if(fetchAllRidesError.message === 'Unauthorized' || fetchMyDetailsError.message === 'Unauthorized' || fetchMyBookingsError.message === 'Unauthorized' || fetchMyRequestsError.message === 'Unauthorized' || fetchAllRidesError.message === 'Unauthorized' || fetchAllCarsError.message === 'Unauthorized' || fetchMiniUsersError.message === 'Unauthorized')
    {
      return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <div style={{width: 900, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
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
  const role = user.role;
  console.log("Role is:" , role);
  let rides = [];
  let allRides = fetchAllRidesData.fetchAllRides;

  const acceptRideFunction = async (id) => {
    acceptRequest({ variables: { id: id }});
    bookingClient.refetchQueries({query: FETCH_REQUESTS_FOR_MY_RIDES_QUERY});
    setTimeout(() => {
      window.location.reload();
    } , 3000);
    
  }

  const rejectRideFunction = async (id) => {
    rejectRequest({ variables: { id: id }});
    bookingClient.refetchQueries({query: FETCH_REQUESTS_FOR_MY_RIDES_QUERY});
    setTimeout(() => {
      window.location.reload();
    } , 3000);
  }


  if(role === 'driver')
  {
    if(fetchMyRidesError || fetchRequestsForAllMyRidesError)
    {
      console.log("Error is:" , fetchMyRidesError);
      console.log("Error 2 is:" , fetchRequestsForAllMyRidesError);
      return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
        </div>
      );
    }
    else if(fetchMyRidesLoading || fetchRequestsForAllMyRidesLoading)
    {
      return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
          <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
        </div>
      );
    }
    rides = fetchMyRidesData.fetchMyRides;

    console.log("Fetch requests data is:" , fetchRequestsForAllMyRidesData);
    console.log("Fetch Requests is:" , fetchRequestsForAllMyRidesData.fetchRequestsForAllMyRides);
    const requests = fetchRequestsForAllMyRidesData.fetchRequestsForAllMyRides;

    for(let i = 0; i < requests.length; i++)
    {
      const ride = allRides.find(ride => ride.id === requests[i].rideId);
      console.log("Ride is:" , ride);
      const departureDate = ride.time.split('T')[0];
      let departureTime = ride.time.split('T')[1];
      departureTime = departureTime.split('.')[0];
      let [hours , minutes , seconds] = departureTime.split(':');
      let timeSign = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      departureTime = hours + ':' + minutes + ' ' + timeSign;
      departureTime = departureDate + " , " + departureTime;

      offers.push({id: requests[i].id , tripId: requests[i].rideId , location: requests[i].subZoneName , departureTime: departureTime , price: requests[i].price , acceptFunction: acceptRideFunction , rejectFunction: rejectRideFunction});
    }

    console.log("Rides is:" , rides);

    const cancelRideFunction = async (id) => {
      cancelRide({ variables: { id: id }});
    }

    rides.forEach(ride => {
      const rideTime = (' ' + ride.time).slice(1);
      const departureDate = rideTime.split('T')[0];
      let departureTime = rideTime.split('T')[1];
      departureTime = departureTime.split('.')[0];
      console.log("Departure time is:" , departureTime);
      let [hours , minutes , seconds] = departureTime.split(':');
      let timeSign = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      departureTime = hours + ':' + minutes + ' ' + timeSign;
      departureTime = departureDate + " , " + departureTime;
      console.log("Ride active is:" , ride.active);
      const data = {tripId : ride.id , location: ride.areaName , departureTime: departureTime , price: ride.basePrice , active: ride.active , cancelFunction: cancelRideFunction};
      tripsOfDriver.push(data);
    });
  }


  const firstRequest = fetchMyRequestsData.fetchMyRequests[0];
  console.log("First request is:" , firstRequest);

  fetchMyRequestsData.fetchMyRequests.forEach(request => {
    const ride = allRides.find(ride => ride.id === request.rideId);
    console.log("Ride is:" , ride);
    const departureDate = ride.time.split('T')[0];
    let departureTime = ride.time.split('T')[1];
    departureTime = departureTime.split('.')[0];
    console.log("Departure time is:" , departureTime);
    let [hours , minutes , seconds] = departureTime.split(':');
    let timeSign = hours >= 12 ? 'PM' : 'AM'; 
    hours = hours % 12; 
    departureTime = hours + ':' + minutes + ' ' + timeSign; 
    departureTime = departureDate + " , " + departureTime; 
    console.log("Departure time is:" , departureTime); 
    console.log("Driver ID is:" , ride.driverId); 
    const car = fetchAllCarsData.cars.find(car => car.DriverId.toString() === ride.driverId.toString()); 
    console.log("Car is:" , car); 
    const driverName = fetchMiniUsersData.Miniusers.find(user => user.universityId.toString() === ride.driverId.toString()).name; 
    const data = {id: request.id ,tripId : request.rideId , type: 'Request' , currentStatus: request.status , tripLocation: ride.areaName , driversName: driverName , departureTime: departureTime , carType: car.carModel , pricePerPerson: request.price , cancelFunction: cancelRequest}; // Create an object with the request data
    if(ride.active)
    {
      activeTripsOfPassenger.push(data);
    }
    else
    {
      tripsOfPassenger.push(data);
    }
  });

  fetchMyBookingsData.fetchMyBookings.forEach(booking => {
    const ride = allRides.find(ride => ride.id === booking.rideId);
    console.log("Ride is:" , ride);
    const departureDate = ride.time.split('T')[0]; 
    let departureTime = ride.time.split('T')[1];
    departureTime = departureTime.split('.')[0]; 
    departureTime = departureDate + " " + departureTime; 
    console.log("Departure time is:" , departureTime);
    let [hours , minutes , seconds] = departureTime.split(':'); 
    let timeSign = hours >= 12 ? 'PM' : 'AM'; 
    hours = hours % 12;
    departureTime = hours + ':' + minutes + ' ' + timeSign; 
    departureTime = departureDate + " , " + departureTime; 
    console.log("Departure time is:" , departureTime); 
    console.log("Driver ID is:" , ride.driverId); 
    const car = fetchAllCarsData.cars.find(car => car.DriverId.toString() === ride.driverId.toString()); 
    console.log("Car is:" , car);
    const driverName = fetchMiniUsersData.Miniusers.find(user => user.universityId.toString() === ride.driverId.toString()).name; 
    const data = {id: booking.id ,tripId : booking.rideId , type: 'Booking' , currentStatus: booking.status , tripLocation: ride.areaName , driversName: driverName, departureTime: departureTime , carType: car.carModel , pricePerPerson: booking.price , cancelFunction: cancelBooking}; // Create an object with the booking data
    if(ride.active) 
    {
      activeTripsOfPassenger.push(data);
    }
    else
    {
      tripsOfPassenger.push(data);
    }
  });
  
  const username = fetchMyDetailsData.fetchMyDetails.name;
  const firstname = username.split(' ')[0];

  console.log("Active trips of passenger is:" , activeTripsOfPassenger);
  console.log("Trips of passenger is:" , tripsOfPassenger);


  if(role === 'admin')
  {
    return (
      <AdminDashboard />
    );
  }

  const navigateToCreateRide = async () => {
    navigate("/createride");
  }

  const navigateToEditUser = async () => {
    navigate("/edituser");
  }

  const navigateToDriverRegistration = async () => {
    navigate("/driverregistration");
  }


  if(role === 'driver')
  {
  if(isCurrentOffers)
  {
    if(isTripStatusSelected)
    {
      return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Dashboard</div>
        <div style={{width: 1060, height: 81, left: '12%', top: 445, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Welcome , {firstname}!</div>
        <ApproveButton label="Edit User" size="offer" functionToCall={navigateToEditUser} topPosition={445} leftPosition={1000} />
        <div style={{width: '70%', height: 0, left: '12%', top: 560.90, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
        <div style={{width: 1060, height: 81, left: '12%', top: 596, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Passenger Dashboard</div>
    
        <ChoiceBarCurrentBooking isChoice={isTripStatusSelected} setChoice={handleTripStatusSelected} firstOption={'Current Trips'} secondOption={'Booking History'} pixelsFromTop={707} />
        <PassengerTripsList trips={activeTripsOfPassenger} isHistory={!isTripStatusSelected} />
    
        <div style={{width: 1060, height: 81, left: '12%', top: 1737, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Driver Dashboard</div>
        <div style={{width: '70%', height: 0, left: '12%', top: 1718, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
    

        <ChoiceBarCurrentBooking isChoice={isCurrentOffers} setChoice={handleCurrentOffers} firstOption={'Current Offers'} secondOption={'Ride History'} pixelsFromTop={1850} />
    
        <ScrollableOffersList offers={offers} />
    
        <ApproveButton label="Offer a Ride" size="offer" functionToCall={navigateToCreateRide} topPosition={2780} leftPosition={909} />
        </div>
      );
    }
    else
    {
            return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Dashboard</div>
        <div style={{width: 1060, height: 81, left: '12%', top: 445, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Welcome , {firstname}!</div>
        <ApproveButton label="Edit User" size="offer" functionToCall={navigateToEditUser} topPosition={445} leftPosition={1000} />
        <div style={{width: '70%', height: 0, left: '12%', top: 560.90, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
        <div style={{width: 1060, height: 81, left: '12%', top: 596, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Passenger Dashboard</div>
    
        <ChoiceBarCurrentBooking isChoice={isTripStatusSelected} setChoice={handleTripStatusSelected} firstOption={'Current Trips'} secondOption={'Booking History'} pixelsFromTop={707} />
        <PassengerTripsList trips={tripsOfPassenger} isHistory={!isTripStatusSelected} />
    
        <div style={{width: 1060, height: 81, left: '12%', top: 1737, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Driver Dashboard</div>
        <div style={{width: '70%', height: 0, left: '12%', top: 1718, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
    
    
        <ChoiceBarCurrentBooking isChoice={isCurrentOffers} setChoice={handleCurrentOffers} firstOption={'Current Offers'} secondOption={'Ride History'} pixelsFromTop={1850} />
    
        <ScrollableOffersList offers={offers} />

        <ApproveButton label="Offer a Ride" size="offer" functionToCall={navigateToCreateRide} topPosition={2780} leftPosition={909} />
        </div>
      );
    }
  }
  else
  {
    return (
      <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
      <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Dashboard</div>
      <div style={{width: 1060, height: 81, left: '12%', top: 445, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Welcome , {firstname}!</div>
      <ApproveButton label="Edit User" size="offer" functionToCall={navigateToEditUser} topPosition={445} leftPosition={1000} />
      <div style={{width: '70%', height: 0, left: '12%', top: 560.90, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
      <div style={{width: 1060, height: 81, left: '12%', top: 596, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Passenger Dashboard</div>
  
      <ChoiceBarCurrentBooking isChoice={isTripStatusSelected} setChoice={handleTripStatusSelected} firstOption={'Current Trips'} secondOption={'Booking History'} pixelsFromTop={707} />
      <PassengerTripsList trips={tripsOfPassenger} isHistory={!isTripStatusSelected} />
  
  
  
      <div style={{width: 1060, height: 81, left: '12%', top: 1737, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Driver Dashboard</div>
      <div style={{width: '70%', height: 0, left: '12%', top: 1718, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
  
      <ChoiceBarCurrentBooking isChoice={isCurrentOffers} setChoice={handleCurrentOffers} firstOption={'Current Offers'} secondOption={'Ride History'} pixelsFromTop={1850} />
  
      <ScrollableDriverTripsList trips={tripsOfDriver} />

      <ApproveButton label="Offer a Ride" size="offer" functionToCall={navigateToCreateRide} topPosition={2780} leftPosition={909} />
    </div>
    );
  }
  }
  else
  {
    if(isTripStatusSelected)
    {
      return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Dashboard</div>
        <div style={{width: 1060, height: 81, left: '12%', top: 445, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Welcome , {firstname}!</div>
        <ApproveButton label="Edit User" size="offer" functionToCall={navigateToEditUser} topPosition={445} leftPosition={1000} />
        <div style={{width: '70%', height: 0, left: '12%', top: 560.90, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
        <div style={{width: 1060, height: 81, left: '12%', top: 596, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Passenger Dashboard</div>
    
        <ChoiceBarCurrentBooking isChoice={isTripStatusSelected} setChoice={handleTripStatusSelected} firstOption={'Current Trips'} secondOption={'Booking History'} pixelsFromTop={707} />
        <PassengerTripsList trips={activeTripsOfPassenger} isHistory={!isTripStatusSelected} />
    
        <div style={{width: 1060, height: 81, left: '12%', top: 1737, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Driver Dashboard</div>
        <div style={{width: '70%', height: 0, left: '12%', top: 1718, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
        <div style={{width: 1300, height: 81, left: '12%', top: 1800, position: 'absolute', color: 'black', fontSize: 50, fontFamily: 'IBM Plex Sans', fontWeight: '300', wordWrap: 'break-word'}}>You are not a driver. To Sign up Please Fill the Registration Form</div>
        <ApproveButton label="Register" size="offer" functionToCall={navigateToDriverRegistration} topPosition={1900} leftPosition={909} />
        </div>
      );
    }
    else
    {
            return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
        <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Dashboard</div>
        <div style={{width: 1060, height: 81, left: '12%', top: 445, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Welcome , {firstname}!</div>
        <ApproveButton label="Edit User" size="offer" functionToCall={navigateToEditUser} topPosition={445} leftPosition={1000} />
        <div style={{width: '70%', height: 0, left: '12%', top: 560.90, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
        <div style={{width: 1060, height: 81, left: '12%', top: 596, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Passenger Dashboard</div>
    
        <ChoiceBarCurrentBooking isChoice={isTripStatusSelected} setChoice={handleTripStatusSelected} firstOption={'Current Trips'} secondOption={'Booking History'} pixelsFromTop={707} />
        <PassengerTripsList trips={tripsOfPassenger} isHistory={!isTripStatusSelected} />
    
        <div style={{width: 1060, height: 81, left: '12%', top: 1737, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Driver Dashboard</div>
        <div style={{width: '70%', height: 0, left: '12%', top: 1718, position: 'absolute', outline: '5px black solid', outlineOffset: '-2.50px'}}></div>
        <div style={{width: 1300, height: 81, left: '12%', top: 1800, position: 'absolute', color: 'black', fontSize: 50, fontFamily: 'IBM Plex Sans', fontWeight: '300', wordWrap: 'break-word'}}>You are not a driver. To Sign up Please Fill the Registration Form</div>
        <ApproveButton label="Register" size="offer" functionToCall={navigateToDriverRegistration} topPosition={1900} leftPosition={909} />
        </div>
      );
    }
  }
}

const client = new ApolloClient({
  uri: 'https://userservice-production-63de.up.railway.app/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});

const rideClient = new ApolloClient({
  uri: 'https://rideservice-production.up.railway.app/ride',
  cache: new InMemoryCache(),
  credentials: 'include',
});

const bookingClient = new ApolloClient({
  uri: 'https://bookingservice-production-4772.up.railway.app/booking',
  cache: new InMemoryCache(),
  credentials: 'include',
});

const Dashboard = () => {
  
  return (
      <DashboardPage />
  )
}

export default Dashboard;