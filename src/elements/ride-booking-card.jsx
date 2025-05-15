import '../App.css';

export default function RideBookingCard({userId , tripLocation , fromToGiu , girlsOnly , driversName , departureTime , seatsLeft , carType , basePrice , percentLeft , percentTop})
{
    const girlsOnlyString = girlsOnly ? 'Girls-Only' : 'Not Girls-Only';
    const fromToGiuString = fromToGiu ? 'From GIU' : 'To GIU';
    return (
        <div style={{ width: 1070, height: 240, left: percentLeft, top: percentTop, position: 'absolute', background: 'white', borderRadius: 20, border: '4px black solid'}}>
        <div style={{width: 774, height: 46, left: 20, top: 4, position: 'absolute', color: 'black', fontSize: 31, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>{tripLocation} Ride {fromToGiuString} ({girlsOnlyString})</div>

        <div style={{width: 234, height: 28, left: 20, top: 60, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Driver’s Name:</div>
        <div style={{width: 317, height: 31, left: 20, top: 88, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{driversName}</div>

        <div style={{width: 250, height: 28, left: 320, top: 60, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Departure Time:</div>
        <div style={{width: 238.43, height: 31, left: 320, top: 88, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>11:45 AM</div>

        <div style={{width: 160, height: 28, left: 640, top: 60, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Seats Left:</div>
        <div style={{width: 238.43, height: 31, left: 640, top: 88, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{seatsLeft} Seats</div>

        <div style={{width: 234, height: 28, left: 20, top: 140, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Car Type:</div>
        <div style={{width: 317, height: 31, left: 20, top: 168, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{carType}</div>

        <div style={{width: 250, height: 28, left: 320, top: 140, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Price:</div>
        <div style={{width: 238.43, height: 31, left: 320, top: 168, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-break-word'}}>{basePrice} EGP</div>
        </div>
    );
}