import '../App.css';
import RejectButton from './reject-button';
export default function DriverTripInfoCard({tripId , location , departureTime , price , active , cancelFunction , percentTop})
{
    if(!active)
    {
        return (
            <div style={{width: 873.41, height: 238, left: '8%', top: percentTop + '%' , position: 'absolute', background: 'white', borderRadius: 20, border: '4px black solid'}}>
                <div style={{width: 768.20, height: 53, left: '2%', top: '5%', position: 'absolute', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Trip {tripId} from {location}</div>
                <div style={{width: 350, height: 28, left: '2%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Departure Date & Time:</div> 
                <div style={{width: 500, height: 62, left: '2%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{departureTime}</div>
                <div style={{width: 250, height: 28, left: '2%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Base Price</div>
                <div style={{width: 238.43, height: 31, left: '2%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{price} EGP</div>
            </div> 
        );
    }
    else
    {
        return (
            <div style={{width: 873.41, height: 238, left: '8%', top: percentTop + '%' , position: 'absolute', background: 'white', borderRadius: 20, border: '4px black solid'}}>
                <div style={{width: 768.20, height: 53, left: '2%', top: '5%', position: 'absolute', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Trip {tripId} from {location}</div>
                <div style={{width: 350, height: 28, left: '2%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Departure Date & Time:</div> 
                <div style={{width: 500, height: 62, left: '2%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{departureTime}</div>
                <div style={{width: 250, height: 28, left: '2%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Base Price</div>
                <div style={{width: 238.43, height: 31, left: '2%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{price} EGP</div>
                <RejectButton label={'Cancel'} functionToCall={() => {cancelFunction(tripId)}} topPosition={160} leftPosition={650} size={'small'}/>
            </div> 
        );
    }
}