import '../App.css';
import DriverTripInfoCard from './driver-trip-info-card';

export default function ScrollableDriverTripsList({trips}) {
    let percent = 0;
    let firstTime = true;
    return (
        <div style={{width: 1060, display: 'flex', flexDirection: 'column', gap: '2vh' , overflowY: 'auto', height: 760.85, left: '15%', top: 1976, position: 'absolute', background: '#EDEDED', border: '10px black solid'}}>
            {trips.map((trip) => {
                if (firstTime) {
                    percent = 4;
                    firstTime = false;
                }
                else
                {
                    percent += 40;
                }
                return <DriverTripInfoCard tripId={trip.tripId} location={trip.location} departureTime={trip.departureTime} price={trip.price} percentTop={percent} active={trip.active} cancelFunction={trip.cancelFunction} />
            })}
        </div>
    );
}