import "../App.css";
import AdminResponseCard from "./admin-response-card";

export default function ScrollableAdminResponsesList({adminResponses}) {
    let percent = 0;
    let firstTime = true;
    return (
        <div style={{width: 1060, display: 'flex', flexDirection: 'column', gap: '2vh' , overflowY: 'auto', height: 760.85, left: '15%', top: 1400, position: 'absolute', background: '#EDEDED', border: '10px black solid'}}>
            {adminResponses.map((adminResponse) => {
                if (firstTime) {
                    percent = 4;
                    firstTime = false;
                }
                else
                {
                    percent += 40;
                }
                return <AdminResponseCard subject={adminResponse.Subject} message={adminResponse.Message} createdAt={adminResponse.createdAt} percentTop={percent} />
            })}
        </div>
    );
}