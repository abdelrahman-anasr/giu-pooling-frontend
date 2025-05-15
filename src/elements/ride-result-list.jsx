import '../App.css';
import RideResultCard from './ride-result-card';

export default function RideResultList({rides , percentTop , percentLeft})
{
    let percent = 0;
    let firstTime = true;
    return (
        <div style={{width: 1060, zIndex: -1, display: 'flex', flexDirection: 'column', gap: '2vh' , overflowY: 'auto', height: 1000, left: percentLeft, top: percentTop, position: 'absolute', background: '#EDEDED', border: '10px black solid'}}>
            {rides.map((ride) => {
                if (firstTime) {
                    percent = 4;
                    firstTime = false;
                }
                else
                {
                    percent += 40;
                }
                return <RideResultCard tripId={ride.tripId} tripLocation={ride.tripLocation} fromToGiu={ride.fromToGiu} girlsOnly={ride.girlsOnly} driversName={ride.driversName} departureTime={ride.departureTime} seatsLeft={ride.seatsLeft} carType={ride.carType} basePrice={ride.basePrice} percentTop={percent} percentLeft={'8%'} requestFunction={ride.functionToCall} />
            })}
        </div>
    );
}