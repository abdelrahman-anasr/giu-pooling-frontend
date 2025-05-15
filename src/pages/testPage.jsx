import React from 'react';
import "../App.css"
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';


const bookingClient = new ApolloClient({
  uri: 'https://bookingservice-production-4772.up.railway.app/booking',
  cache: new InMemoryCache(),
  credentials: 'include',
});

export default function TestPage() {

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

    const {loading : fetchMyBookingsLoading, error : fetchMyBookingsError, data : fetchMyBookingsData} = useQuery(FETCH_BOOKINGS_QUERY , {client: bookingClient});

    if(fetchMyBookingsLoading)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
            </div>
        );
    }

    if(fetchMyBookingsError)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>ERROR</div>
            </div>
        );
    }

    
    return (
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <h1 style={{top: 400 , left: 200 , position: 'absolute'}}>Test Page</h1>
        </div>
    );
}