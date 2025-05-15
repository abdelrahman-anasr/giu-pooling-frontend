import "../App.css";
import ComplaintCard from "./complaint-card";
export default function ScrollableComplaintsList({complaints}) {
    let percent = 0;
    let firstTime = true;
    return (
        <div style={{width: 1060, display: 'flex', flexDirection: 'column', gap: '2vh' , overflowY: 'auto', height: 760.85, left: '15%', top: 450, position: 'absolute', background: '#EDEDED', border: '10px black solid'}}>
            {complaints.map((complaint) => {
                if (firstTime) {
                    percent = 4;
                    firstTime = false;
                }
                else
                {
                    percent += 40;
                }
                return <ComplaintCard subject={complaint.Subject} message={complaint.Message} createdAt={complaint.createdAt} percentTop={percent} />
            })}
        </div>
    );
}