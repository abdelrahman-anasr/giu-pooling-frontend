import '../App.css';
import PassengerTripInfoCard from './passenger-trip-info-card';

export default function ScrollablePassengerTripsList({trips , isHistory}) {
    let percent = 0;
    let firstTime = true;
    return (
        <div style={{width: 1060, display: 'flex', flexDirection: 'column', gap: '2vh' , overflowY: 'auto', height: 760.85, left: '15%', top: 833, position: 'absolute', background: '#EDEDED', border: '10px black solid'}}>
            {trips.map((trip) => {
                if (firstTime) {
                    percent = 4;
                    firstTime = false;
                }
                else
                {
                    percent += 40;
                }
                return <PassengerTripInfoCard tripId={trip.id} cancelFunction={trip.cancelFunction} type={trip.type} currentStatus={trip.currentStatus} tripLocation={trip.tripLocation} driversName={trip.driversName} departureTime={trip.departureTime} seatsLeft={trip.seatsLeft} carType={trip.carType} pricePerPerson={trip.pricePerPerson} percentTop={percent} isHistory={isHistory} />
            })}
        </div>
    );
}