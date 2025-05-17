import "../App.css";
import { useState , setState } from 'react';
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import RideBookingCard from "../elements/ride-booking-card";
import TextBox from "../elements/text-box";
import Dropdown from "../elements/dropdown";
import InfographicBox from "../elements/infographic-box";
import ApproveButton from "../elements/approve-button";


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


export default function BookingPage() {

    const navigate = useNavigate();
    const [searchParams , setSearchParams] = useSearchParams();

    const [subzoneValue , setSubzoneValue] = useState('Select Subzone');
    const [subzoneOpened , setSubzoneOpened] = useState(false);
    const [subzoneNotSelectedError , setSubzoneNotSelectedError] = useState(false);
    const [paymentScreenOpened , setPaymentScreenOpened] = useState(false);
    const [totalPrice , setTotalPrice] = useState(0);
    const [cashOptionSelected , setCashOptionSelected] = useState(true);

    useEffect(() => {
    }, [paymentScreenOpened , totalPrice]);

    let subzones = []

    const rideId = searchParams.get('rideId');

    console.log("Ride ID is:" , rideId);

    const FETCH_RIDE_QUERY = gql`
    query FetchRide($id: Int!) {
        fetchRide(id: $id) {
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
    }
    `;

    const MINI_USERS_QUERY = gql`
    query MiniUsers {
        Miniusers {
            universityId
            name
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
    }`;

    const FETCH_ALL_SUBZONES = gql`
    query FetchAllSubzones {
        fetchAllSubzones {
            subzoneName
            areaName
            subZonePrice
        }
    }`;

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

  const FETCH_BOOKINGS_QUERY = gql`
  query FetchMyBookings {
    fetchMyBookings {
        id
        studentId
        rideId
        status
        price
    }
  }`;

  const FETCH_REQUESTS_QUERY = gql`
  query FetchMyRequests {
    fetchMyRequests {
        id
        studentId
        rideId
        status
        price
    }
  }`;

    const CREATE_REQUEST_QUERY = gql`
    mutation CreateRequest($rideId: Int!, $subzoneName: String!, $paymentOption: String!) {
        createRequest(rideId: $rideId, subzoneName: $subzoneName, paymentOption: $paymentOption) {
            id
            studentId
            rideId
            status
            price
        }
    }`;

    const {loading: fetchMyBookingsLoading, error: fetchMyBookingsError, data: fetchMyBookingsData} = useQuery(FETCH_BOOKINGS_QUERY , {client: bookingClient});

    const {loading: fetchMyRequestsLoading, error: fetchMyRequestsError, data: fetchMyRequestsData} = useQuery(FETCH_REQUESTS_QUERY , {client: bookingClient});

    const {loading : fetchMyDetailsLoading, error : fetchMyDetailsError, data : fetchMyDetailsData} = useQuery(FETCH_DETAILS_QUERY , {client: client});

    const {loading : fetchRideLoading, error : fetchRideError, data : fetchRideData} = useQuery(FETCH_RIDE_QUERY , {client: rideClient, variables: {id: Number(rideId)}});

    const {data : fetchAllCarsData, loading : fetchAllCarsLoading, error : fetchAllCarsError} = useQuery(FETCH_ALL_CARS_QUERY , {client: client});

    const { loading: miniUsersLoading, error: miniUsersError, data: miniUsersData } = useQuery(MINI_USERS_QUERY , {client: client});

    const { loading: allSubzonesLoading, error: allSubzonesError, data: allSubzonesData } = useQuery(FETCH_ALL_SUBZONES , {client: rideClient});

    const [createRequestMutation, { createRequestData, createRequestLoading, createRequestError }] =  useMutation(CREATE_REQUEST_QUERY , {client: bookingClient});

    if( fetchMyDetailsLoading || fetchRideLoading || fetchAllCarsLoading || miniUsersLoading || allSubzonesLoading || fetchMyBookingsLoading || fetchMyRequestsLoading)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
            </div>
        );
    }

    if(fetchMyDetailsError ||fetchRideError || fetchAllCarsError || miniUsersError || allSubzonesError || fetchMyBookingsError || fetchMyRequestsError)
    {
        console.log("Fetch my details error is:" , fetchMyDetailsError);
        console.log("Fetch ride error is:" , fetchRideError);
        console.log("Fetch all cars error is:" , fetchAllCarsError);
        console.log("Mini users error is:" , miniUsersError);
        console.log("All subzones error is:" , allSubzonesError);
        console.log("Fetch my bookings error is:" , fetchMyBookingsError);
        console.log("Fetch my requests error is:" , fetchMyRequestsError);
        if((fetchMyDetailsError !== undefined && fetchMyDetailsError.message === 'Unauthorized') || (fetchRideError !== undefined && fetchRideError.message === 'Unauthorized') || (fetchAllCarsError !== undefined && fetchAllCarsError.message === 'Unauthorized') || (miniUsersError !== undefined && miniUsersError.message === 'Unauthorized') || (allSubzonesError !== undefined && allSubzonesError.message === 'Unauthorized') || (fetchMyBookingsError !== undefined && fetchMyBookingsError.message === 'Unauthorized') || (fetchMyRequestsError !== undefined && fetchMyRequestsError.message === 'Unauthorized'))
        {
            return (
                <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 900, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You are Unauthorized to access this page</div>
                </div>
            );
        }
        
        console.log("All subzones error is:" , allSubzonesError);
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
            </div>
        );
    }

    const details = fetchMyDetailsData;
    const userId = JSON.stringify(details.fetchMyDetails.universityId);

    const ride = fetchRideData.fetchRide;
    const driversName = miniUsersData.Miniusers.find(user => user.universityId.toString() === ride.driverId.toString()).name;
    const carType = fetchAllCarsData.cars.find(car => car.DriverId.toString() === ride.driverId.toString()).carModel;

    const zones = allSubzonesData.fetchAllSubzones.filter(subzone => subzone.areaName === ride.areaName);

    const booking = fetchMyBookingsData.fetchMyBookings.find(booking => booking.rideId.toString() === ride.id.toString());
    const request = fetchMyRequestsData.fetchMyRequests.find(request => request.rideId.toString() === ride.id.toString());

    console.log("Booking is:" , booking);
    console.log("Request is:" , request);

    if(!ride.active)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 1300, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Ride is no longer active</div>
                <RideBookingCard userId={1} tripLocation={ride.areaName} fromToGiu={ride.fromGiu} girlsOnly={ride.girlsOnly} driversName={driversName} departureTime={ride.time} seatsLeft={ride.seatsLeft} carType={carType} basePrice={ride.basePrice} percentLeft={'12%'} percentTop={570} />
            </div>
        );
    }

    if(booking !== undefined)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 1300, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You have already booked this ride</div>
                <RideBookingCard userId={1} tripLocation={ride.areaName} fromToGiu={ride.fromGiu} girlsOnly={ride.girlsOnly} driversName={driversName} departureTime={ride.time} seatsLeft={ride.seatsLeft} carType={carType} basePrice={ride.basePrice} percentLeft={'12%'} percentTop={570} />
            </div>
        );
    }

    if(request !== undefined)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 1300, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You have already requested this ride</div>
                <RideBookingCard userId={1} tripLocation={ride.areaName} fromToGiu={ride.fromGiu} girlsOnly={ride.girlsOnly} driversName={driversName} departureTime={ride.time} seatsLeft={ride.seatsLeft} carType={carType} basePrice={ride.basePrice} percentLeft={'12%'} percentTop={570} />
            </div>
        );
    } 

    subzones = zones.map(zone => {
        return {label: zone.subzoneName , value: zone.subzoneName};
    });

    const nextScreenFunction = async () => {
        if(subzoneValue === 'Select Subzone')
        {
            setSubzoneNotSelectedError(true);
            return;
        }
        const subzone = zones.find(subzone => subzone.subzoneName === subzoneValue);
        const price = ride.basePrice + subzone.subZonePrice;
        console.log("total price is:" , price);
        setTotalPrice(Number(price));
        setPaymentScreenOpened(true);
    }

    const createRequestFunction = async () => {
        const paymentOption = cashOptionSelected ? 'Cash' : 'Visa';
        createRequestMutation({
            variables: {
                rideId: ride.id,
                subzoneName: subzoneValue,
                paymentOption: paymentOption
            }
        });
        navigate('/dashboard');
    }

    if(!paymentScreenOpened)
    {
        if(!subzoneNotSelectedError)
        {
            return (
                <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>

                    <div style={{width: 492, height: 98, left: '12%', top: 288, position: 'absolute', color: 'black', fontSize: 84, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Book a Ride</div>
                    <div style={{width: 700, height: 83, left: '12%', top: 425, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Address Registration </div>
                    <RideBookingCard userId={1} tripLocation={ride.areaName} fromToGiu={ride.fromGiu} girlsOnly={ride.girlsOnly} driversName={driversName} departureTime={ride.time} seatsLeft={ride.seatsLeft} carType={carType} basePrice={ride.basePrice} percentLeft={'12%'} percentTop={530} />

                    <div style={{width: 1060, height: 378, left: '12%', top: 828, position: 'absolute', background: 'white', border: '8px black solid'}} />

                    <InfographicBox label={'Location'} value={ride.areaName} leftPosition={277} topPosition={877} />

                    <Dropdown label={'Subzone'} open={subzoneOpened} value={subzoneValue} items={subzones} setOpen={setSubzoneOpened} setValue={setSubzoneValue} topPosition={1010} leftPosition={280} />

                    <ApproveButton label={'Confirm'} functionToCall={(async () => {await nextScreenFunction()})} topPosition={1120} leftPosition={970} size={'large'}/>

                </div>
            );
        }
        else
        {
            return (
                <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>

                    <div style={{width: 492, height: 98, left: '12%', top: 288, position: 'absolute', color: 'black', fontSize: 84, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Book a Ride</div>
                    <div style={{width: 700, height: 83, left: '12%', top: 425, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Address Registration </div>
                    <RideBookingCard userId={1} tripLocation={ride.areaName} fromToGiu={ride.fromGiu} girlsOnly={ride.girlsOnly} driversName={driversName} departureTime={ride.time} seatsLeft={ride.seatsLeft} carType={carType} basePrice={ride.basePrice} percentLeft={'12%'} percentTop={530} />
                    <div style={{width: 900, height: 98, left: '12%', top: 780, position: 'absolute', color: 'red', fontSize: 30, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You Must Select a Subzone</div>

                    <div style={{width: 1060, height: 378, left: '12%', top: 828, position: 'absolute', background: 'white', border: '8px black solid'}} />

                    <InfographicBox label={'Location'} value={ride.areaName} leftPosition={277} topPosition={877} />

                    <Dropdown label={'Subzone'} open={subzoneOpened} value={subzoneValue} items={subzones} setOpen={setSubzoneOpened} setValue={setSubzoneValue} topPosition={1010} leftPosition={280} />

                    <ApproveButton label={'Confirm'} functionToCall={(async () => {await nextScreenFunction()})} topPosition={1120} leftPosition={970} size={'large'}/>

                </div>
            );
        }
    }
    else
    {
        if(cashOptionSelected)
        {
            return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>

                <div style={{width: 1200, height: 98, left: '12%', top: 288, position: 'absolute', color: 'black', fontSize: 84, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Payment Methods </div>

                <button style={{width: 30, height: 30, left: 390, top: 470, position: 'absolute', background: '#D52029', borderRadius: 9999, border: '1px #6B72D6 solid'}} />
                <div style={{width: 300, height: 31.52, left: 425, top: 468, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#585858', fontSize: 36, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Pay with cash</div>


                <button onClick={() => {setCashOptionSelected(false)}}  style={{width: 30, height: 30, left: 390, top: 540, position: 'absolute', background: 'white', borderRadius: 9999, border: '1px #6C6C6C solid'}} />
                <div style={{width: 363.07, height: 41.83, left: 433, top: 534, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6C6C6C', fontSize: 36, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Credit/Debit Cards</div>
                <ApproveButton label={'Pay ' + totalPrice + ' EGP'} functionToCall={() => {createRequestFunction()}} topPosition={600} leftPosition={970} size={'pay'}/>
            </div>
            );            
        }
        else
        {
            return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>

                <div style={{width: 1200, height: 98, left: '12%', top: 288, position: 'absolute', color: 'black', fontSize: 84, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Payment Methods </div>

                <button onClick={() => {setCashOptionSelected(true)}} style={{width: 30, height: 30, left: 390, top: 470, position: 'absolute', background: 'white', borderRadius: 9999, border: '1px #6C6C6C solid'}} />
                <div style={{width: 300, height: 31.52, left: 425, top: 468, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#585858', fontSize: 36, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Pay with cash</div>


                <button style={{width: 30, height: 30, left: 390, top: 540, position: 'absolute', background: '#D52029', borderRadius: 9999, border: '1px #6B72D6 solid'}} /> 
                <div style={{width: 363.07, height: 41.83, left: 433, top: 534, position: 'absolute', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6C6C6C', fontSize: 36, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Credit/Debit Cards</div>

                <ApproveButton label={'Pay ' + totalPrice + ' EGP'} functionToCall={() => {createRequestFunction()}} topPosition={600} leftPosition={970} size={'pay'}/>
            </div>
            );    
        }
    }
}