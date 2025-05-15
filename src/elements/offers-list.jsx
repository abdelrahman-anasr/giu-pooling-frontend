import '../App.css';
import OfferInfoCard from './offer-info-card';

export default function ScrollableOffersList({offers}) {
    let percent = 0;
    let firstTime = true;
    return (
        <div style={{width: 1060, display: 'flex', flexDirection: 'column', gap: '2vh' , overflowY: 'auto', height: 760.85, left: '15%', top: 1976, position: 'absolute', background: '#EDEDED', border: '10px black solid'}}>
            {offers.map((offer) => {
                if (firstTime) {
                    percent = 4;
                    firstTime = false;
                }
                else
                {
                    percent += 40;
                }
                return <OfferInfoCard tripId={offer.tripId} location={offer.location} departureTime={offer.departureTime} price={offer.price} percentTop={percent} />
            })}
        </div>
    );
}