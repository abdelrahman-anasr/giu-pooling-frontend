import PassengerTripInfoCard from '../elements/passenger-trip-info-card';
import PassengerTripsList from '../elements/passenger-trips-list';
import { useEffect } from 'react';
import ChoiceBarCurrentBooking from '../elements/choice-bar-current-booking'
import ScrollableOffersList from '../elements/offers-list'
import ScrollableDriverTripsList from '../elements/driver-trip-list'
import OfferInfoCard from '../elements/offer-info-card';
import { useState , setState } from 'react';
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { useNavigate , createSearchParams } from 'react-router-dom';
import '../App.css';
import Navbar from '../elements/navbar';
import RideResultCard from '../elements/ride-result-card';
import RideResultList from '../elements/ride-result-list';
import FilterBox from '../elements/filter-element';


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

export default function Results() {

    const navigate = useNavigate();
    const [error , setError] = useState(false);
    const [errorMessage , setErrorMessage] = useState("");
    const [searchParams , setSearchParams] = useSearchParams();
    const locationParams = searchParams.get('location');
    const fromToParams = searchParams.get('fromGiu');
    const girlsOnlyParams = searchParams.get('girlsOnly');

    const fromToParamString = fromToParams === 'true' ? 'From GIU' : 'To GIU';

    const fromToBoolean = fromToParams === 'true' ? true : false;

    const [filterOpened , setFilterOpened] = useState(false);
    const [fromToOpened , setFromToOpened] = useState(false);
    const [fromToValue , setFromToValue] = useState(fromToParamString);
    const [itemsFromTo , setItemsFromTo] = useState([ 
        {label: 'From GIU' , value: 'From GIU'},
        {label: 'To GIU' , value: 'To GIU'}
    ]);

    const [locationOpened , setLocationOpened] = useState(false);
    const [locationValue , setLocationValue] = useState(locationParams);
    let itemsLocation = [];

    const [girlsOnly , setGirlsOnly] = useState(girlsOnlyParams === 'true' ? true : false);
    useEffect(() => {
    }, [fromToValue , fromToOpened]);

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

    const ALL_AREAS_QUERY = gql`
        query FetchAllAreas {
            fetchAllAreas {
                areaName
                basePrice
                distanceFromGiu
            }
        }
    `;

    const RESULTS_QUERY = gql`
    query FetchRideByCriteria($areaName: String!, $fromGiu: Boolean!, $girlsOnly: Boolean!) {
        fetchRideByCriteria(areaName: $areaName, fromGiu: $fromGiu, girlsOnly: $girlsOnly) {
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

    const MINI_USERS_QUERY = gql`
    query Miniusers {
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



    const {loading : fetchMyDetailsLoading, error : fetchMyDetailsError, data : fetchMyDetailsData} = useQuery(FETCH_DETAILS_QUERY , {client: client});

    const {data : fetchMyBookingsData, loading : fetchMyBookingsLoading, error : fetchMyBookingsError} = useQuery(FETCH_BOOKINGS_QUERY , {client: bookingClient , fetchPolicy: 'no-cache'});

    const {data : fetchMyRequestsData, loading : fetchMyRequestsLoading, error : fetchMyRequestsError} = useQuery(FETCH_REQUESTS_QUERY , {client: bookingClient, fetchPolicy: 'no-cache'});

    const { loading: areaLoading, error: areaError, data: areaData } = useQuery(ALL_AREAS_QUERY , {client: rideClient});

    const { loading: resultsLoading, error: resultsError, data: resultsData } = useQuery(RESULTS_QUERY , {client: rideClient, fetchPolicy: 'no-cache', variables: {areaName: locationValue, fromGiu: fromToBoolean, girlsOnly: girlsOnly}});

    const {data : fetchAllCarsData, loading : fetchAllCarsLoading, error : fetchAllCarsError} = useQuery(FETCH_ALL_CARS_QUERY , {client: client});

    const { loading: miniUsersLoading, error: miniUsersError, data: miniUsersData } = useQuery(MINI_USERS_QUERY , {client: client});

    if(areaLoading || resultsLoading || miniUsersLoading || fetchMyDetailsLoading || fetchAllCarsLoading || fetchMyBookingsLoading || fetchMyRequestsLoading) {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
            </div>
        );
    }
    else if(areaError || resultsError || miniUsersError || fetchMyDetailsError || fetchAllCarsError || fetchMyBookingsError || fetchMyRequestsError)
    {
        if((areaError !== undefined && areaError.message === 'Unauthorized') || (resultsError !== undefined && resultsError.message === 'Unauthorized') || (miniUsersError !== undefined && miniUsersError.message === 'Unauthorized') || (fetchMyDetailsError !== undefined && fetchMyDetailsError.message === 'Unauthorized') || (fetchAllCarsError !== undefined && fetchAllCarsError.message === 'Unauthorized') || (fetchMyBookingsError !== undefined && fetchMyBookingsError.message === 'Unauthorized') || (fetchMyRequestsError !== undefined && fetchMyRequestsError.message === 'Unauthorized'))
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

    const redirectFunction = () => {
        console.log("Function called");
    }

    const details = fetchMyDetailsData;
    const userId = JSON.stringify(details.fetchMyDetails.universityId);
    const gender = details.fetchMyDetails.gender;

    console.log("Results data is:" , resultsData);
    console.log("Results error is:" , resultsError);
    console.log("Results loading is:" , resultsLoading);

    if(resultsLoading) {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
            </div>
        );
    }

    areaData.fetchAllAreas.forEach(area => {
        itemsLocation.push({label: area.areaName , value: area.areaName});
    });

    let rides = [
    ];

    const navigateToBookingPage = (id) => {
        const rideFetched = rides.find(ride => ride.tripId === id);
        if(rideFetched.girlsOnly && (gender === 'male' || gender === 'Male'))
        {
            setError(true);
            setErrorMessage("You can't book a girls-only ride as a male");
            return;
        }
        navigate({
            pathname: '/booking',
            search: createSearchParams({
                rideId: id
            }).toString()
        });
    }

    const userBookings = fetchMyBookingsData.fetchMyBookings;
    const userRequests = fetchMyRequestsData.fetchMyRequests;
    let userBookingIds = [];
    userBookings.forEach(booking => {
        userBookingIds.push(booking.rideId);
    });
    userRequests.forEach(request => {
        userBookingIds.push(request.rideId);
    });


    resultsData.fetchRideByCriteria.forEach(ride => {
        if(!userBookingIds.includes(ride.id))
        {
            const carType = fetchAllCarsData.cars.find(car => car.DriverId.toString() === ride.driverId.toString()).carModel;
            const driverName = miniUsersData.Miniusers.find(user => user.universityId.toString() === ride.driverId.toString()).name;
            const departureDate = ride.time.split('T')[0];
            let departureTime = ride.time.split('T')[1];
            departureTime = departureTime.split('.')[0];
            let [hours , minutes , seconds] = departureTime.split(':');
            let timeSign = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            departureTime = hours + ':' + minutes + ' ' + timeSign;
            departureTime = departureDate + " , " + departureTime;
            rides.push({tripId: ride.id , tripLocation: ride.areaName , fromToGiu: ride.fromGiu , girlsOnly: ride.girlsOnly , driversName : driverName , departureTime: departureTime , seatsLeft: ride.seatsLeft, carType: carType , basePrice: ride.basePrice , functionToCall: navigateToBookingPage});
        }
    });



    const func = () => {
        console.log("Function called");
    }

    if(!error)
    {
        return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 900, height: 98, left: '15%', top: 288, position: 'absolute', color: 'black', fontSize: 84, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Book a Ride</div>
            <div style={{width: 441, height: 83, left: '15%', top: 425, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Search Results</div>
            <div style={{width: 202, height: 52, left: 690, top: 444, position: 'absolute', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>({rides.length} Results)</div>

            <FilterBox filterOpened={filterOpened} setFilterOpened={setFilterOpened} percentLeft={1200} percentTop={462} functionToCall={func} itemsFromTo={itemsFromTo} setItemsFromTo={setItemsFromTo} fromToValue={fromToValue} setFromToValue={setFromToValue} fromToOpened={fromToOpened} setFromToOpened={setFromToOpened} itemsLocation={itemsLocation} locationValue={locationValue} setLocationValue={setLocationValue} locationOpened={locationOpened} setLocationOpened={setLocationOpened} girlsOnly={girlsOnly} setGirlsOnly={setGirlsOnly} />
            <RideResultList rides={rides} percentTop={547} percentLeft={'15%'} />
        </div>
        );
    }
    else
    {
        return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 900, height: 98, left: '15%', top: 288, position: 'absolute', color: 'black', fontSize: 84, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Book a Ride</div>
            <div style={{width: 800, height: 83, left: '15%', top: 390, position: 'absolute', color: 'red', fontSize: 30, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>{errorMessage}</div>
            <div style={{width: 441, height: 83, left: '15%', top: 425, position: 'absolute', color: 'black', fontSize: 62, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Search Results</div>
            <div style={{width: 202, height: 52, left: 690, top: 444, position: 'absolute', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>({rides.length} Results)</div>

            <FilterBox filterOpened={filterOpened} setFilterOpened={setFilterOpened} percentLeft={1200} percentTop={462} functionToCall={func} itemsFromTo={itemsFromTo} setItemsFromTo={setItemsFromTo} fromToValue={fromToValue} setFromToValue={setFromToValue} fromToOpened={fromToOpened} setFromToOpened={setFromToOpened} itemsLocation={itemsLocation} locationValue={locationValue} setLocationValue={setLocationValue} locationOpened={locationOpened} setLocationOpened={setLocationOpened} girlsOnly={girlsOnly} setGirlsOnly={setGirlsOnly} />
            <RideResultList rides={rides} percentTop={547} percentLeft={'15%'} />
        </div>
        );
    }
 }