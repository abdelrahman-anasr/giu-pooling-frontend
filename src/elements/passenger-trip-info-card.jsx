import '../App.css';
import ApproveButton from './approve-button';
import RejectButton from './reject-button';
export default function PassengerTripInfoCard({tripId , type , currentStatus , tripLocation , driversName , departureTime , carType , pricePerPerson , percentTop , isHistory , cancelFunction}) {
    if(!isHistory)
    {
        if(currentStatus === 'Accepted (Unpaid)' || currentStatus === 'Paid' || currentStatus === 'Payment in Cash')
        {
            return (
            <div style={{width: 873.41, height: 238, left: '8%', top: percentTop + '%' , position: 'absolute', background: 'white', borderRadius: 20, border: '4px black solid'}}>
                <div style={{width: 768.20, height: 53, left: '2%', top: '5%', position: 'absolute', color: 'black', fontSize: 30, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Trip from {tripLocation} - {type}</div> 
                <div style={{width: 248.03, height: 28, left: '65%', top: '2%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Current Trip Status:</div>
                <div style={{width: 248.03, height: 28, left: '65%', top: '14%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{currentStatus}</div> 
                <div style={{width: 174.95, height: 28, left: '2%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Driver’s Name:</div> 
                <div style={{width: 237, height: 31, left: '2%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{driversName}</div>
                <div style={{width: 250, height: 28, left: '40%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Departure Time:</div> 
                <div style={{width: 238, height: 62, left: '40%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{departureTime}</div>
                <div style={{width: 174.95, height: 28, left: '2%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Car Type:</div>  
                <div style={{width: 237, height: 31, left: '2%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{carType}</div> 
                <div style={{width: 250, height: 28, left: '40%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Price:</div>
                <div style={{width: 238.43, height: 31, left: '40%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{pricePerPerson} EGP</div>
                <RejectButton label={'Cancel'} functionToCall={() => {cancelFunction({variables: {id: tripId}})}} topPosition={'70%'} leftPosition={'74%'} size={'small'}/>
            </div>
            );
        }
        else if(currentStatus === 'Cancelled')
        {
            return (
            <div style={{width: 873.41, height: 238, left: '8%', top: percentTop + '%' , position: 'absolute', background: 'white', borderRadius: 20, border: '4px black solid'}}>
                <div style={{width: 768.20, height: 53, left: '2%', top: '5%', position: 'absolute', color: 'black', fontSize: 30, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Trip from {tripLocation} - {type}</div> 
                <div style={{width: 248.03, height: 28, left: '65%', top: '2%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Current Trip Status:</div>
                <div style={{width: 248.03, height: 28, left: '65%', top: '14%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{currentStatus}</div> 
                <div style={{width: 174.95, height: 28, left: '2%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Driver’s Name:</div> 
                <div style={{width: 237, height: 31, left: '2%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{driversName}</div>
                <div style={{width: 250, height: 28, left: '40%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Departure Time:</div> 
                <div style={{width: 238, height: 62, left: '40%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{departureTime}</div>
                <div style={{width: 174.95, height: 28, left: '2%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Car Type:</div>  
                <div style={{width: 237, height: 31, left: '2%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{carType}</div> 
                <div style={{width: 250, height: 28, left: '40%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Price:</div>
                <div style={{width: 238.43, height: 31, left: '40%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{pricePerPerson} EGP</div>
            </div>
            );
        }
        else if(currentStatus.includes("Awaiting Driver's Response"))
        {
            return (
            <div style={{width: 873.41, height: 238, left: '8%', top: percentTop + '%' , position: 'absolute', background: 'white', borderRadius: 20, border: '4px black solid'}}>
                <div style={{width: 768.20, height: 53, left: '2%', top: '5%', position: 'absolute', color: 'black', fontSize: 30, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Trip from {tripLocation} - {type}</div> 
                <div style={{width: 248.03, height: 28, left: '65%', top: '2%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Current Trip Status:</div>
                <div style={{width: 248.03, height: 28, left: '65%', top: '14%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{currentStatus}</div> 
                <div style={{width: 174.95, height: 28, left: '2%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Driver’s Name:</div> 
                <div style={{width: 237, height: 31, left: '2%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{driversName}</div>
                <div style={{width: 250, height: 28, left: '40%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Departure Time:</div> 
                <div style={{width: 238, height: 62, left: '40%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{departureTime}</div>
                <div style={{width: 174.95, height: 28, left: '2%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Car Type:</div>  
                <div style={{width: 237, height: 31, left: '2%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{carType}</div> 
                <div style={{width: 250, height: 28, left: '40%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Price:</div>
                <div style={{width: 238.43, height: 31, left: '40%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{pricePerPerson} EGP</div>
                <RejectButton label={'Cancel'} functionToCall={() => {cancelFunction({variables: {id: tripId}})}} topPosition={'70%'} leftPosition={'74%'} size={'small'}/>
            </div>
            );
        }
    }
    else
    {
        return (
            <div style={{width: 873.41, height: 238, left: '8%', top: percentTop + '%' , position: 'absolute', background: 'white', borderRadius: 20, border: '4px black solid'}}>
                <div style={{width: 768.20, height: 53, left: '2%', top: '5%', position: 'absolute', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>Trip from {tripLocation}</div> 
                <div style={{width: 174.95, height: 28, left: '2%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Driver’s Name:</div> 
                <div style={{width: 237, height: 31, left: '2%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{driversName}</div>
                <div style={{width: 250, height: 28, left: '40%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Departure Time:</div> 
                <div style={{width: 238, height: 62, left: '40%', top: '41%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{departureTime}</div>
                <div style={{width: 174.95, height: 28, left: '2%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Car Type:</div>  
                <div style={{width: 237, height: 31, left: '2%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{carType}</div> 
                <div style={{width: 250, height: 28, left: '40%', top: '70%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>Base Price</div>
                <div style={{width: 238.43, height: 31, left: '40%', top: '82%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{pricePerPerson} EGP</div>
            </div>
        );
    }
}