import React from "react"; 
import "../App.css";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ApolloClient , InMemoryCache , ApolloProvider , gql, useQuery , useMutation , useLazyQuery} from '@apollo/client';
import { useNavigate , createSearchParams } from "react-router-dom";
import Dropdown from "../elements/dropdown";
import TickButton from "../elements/tick-button";
import ApproveButton from "../elements/approve-button";
import BookFilterBox from "../elements/book-filter-box";


const rideClient = new ApolloClient({
    uri: 'https://rideservice-production.up.railway.app/ride',
    cache: new InMemoryCache(),
    credentials: 'include',
});
export default function BookSearch() {

    const navigate = useNavigate();

    const [fromToOpened , setFromToOpened] = useState(false);
    const [fromToValue , setFromToValue] = useState('From GIU');
    const [itemsFromTo , setItemsFromTo] = useState([ 
        {label: 'From GIU' , value: 'From GIU'},
        {label: 'To GIU' , value: 'To GIU'}
    ]);
    const [locationValue , setLocationValue] = useState('Select Location');
    const [locationOpened , setLocationOpened] = useState(false);
    const [locationNotSelectedError , setLocationNotSelectedError] = useState(false);
    let itemsLocation = [];

    const [girlsOnly , setGirlsOnly] = useState(false);


    useEffect(() => {
    }, [fromToValue , fromToOpened]);


    const ALL_AREAS_QUERY = gql`
        query FetchAllAreas {
            fetchAllAreas {
                areaName
                basePrice
                distanceFromGiu
            }
        }
    `;

    const { loading: areaLoading, error: areaError, data: areaData } = useQuery(ALL_AREAS_QUERY , {client: rideClient});

    if(areaLoading) {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
            <div style={{width: 510, height: 115, left: '12%', top: 315, position: 'absolute', color: 'black', fontSize: 96, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>LOADING...</div>
            </div>
        );
    }
    else if(areaError)
    {
        if(areaError.message === 'Unauthorized')
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

    console.log("Areas data is:" , areaData);
    console.log("Areas error is:" , areaError);
    console.log("Areas loading is:" , areaLoading);

    areaData.fetchAllAreas.forEach(area => {
        itemsLocation.push({label: area.areaName , value: area.areaName});
    });


    const func = () => {
        if(locationValue === 'Select Location')
        {
            setLocationNotSelectedError(true);
            return;
        }
        const fromToBoolean = fromToValue === 'From GIU' ? true : false;
        navigate({
            pathname: '/search',
            search: createSearchParams({
                location: locationValue,
                fromGiu: fromToBoolean,
                girlsOnly: girlsOnly
            }).toString()
        });
    }
    if(!locationNotSelectedError)
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 900, height: 98, left: '15%', top: 288, position: 'absolute', color: 'black', fontSize: 84, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Book a Ride</div>

                <BookFilterBox functionToCall={func} itemsFromTo={itemsFromTo} setItemsFromTo={setItemsFromTo} fromToValue={fromToValue} setFromToValue={setFromToValue} fromToOpened={fromToOpened} setFromToOpened={setFromToOpened} itemsLocation={itemsLocation} locationValue={locationValue} setLocationValue={setLocationValue} locationOpened={locationOpened} setLocationOpened={setLocationOpened} girlsOnly={girlsOnly} setGirlsOnly={setGirlsOnly} leftPosition={'15%'} topPosition={400} />
            </div>
        );
    }
    else
    {
        return (
            <div style={{width: '100%', height: '100%', position: 'relative', background: '#FFF8EF'}}>
                <div style={{width: 900, height: 98, left: '15%', top: 270, position: 'absolute', color: 'black', fontSize: 84, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Book a Ride</div>
                <div style={{width: 900, height: 98, left: '15.4%', top: 360, position: 'absolute', color: 'red', fontSize: 30, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>You Must Select a Location</div>
                <BookFilterBox functionToCall={func} itemsFromTo={itemsFromTo} setItemsFromTo={setItemsFromTo} fromToValue={fromToValue} setFromToValue={setFromToValue} fromToOpened={fromToOpened} setFromToOpened={setFromToOpened} itemsLocation={itemsLocation} locationValue={locationValue} setLocationValue={setLocationValue} locationOpened={locationOpened} setLocationOpened={setLocationOpened} girlsOnly={girlsOnly} setGirlsOnly={setGirlsOnly} leftPosition={'15%'} topPosition={400} />
            </div>
        );
    }
}