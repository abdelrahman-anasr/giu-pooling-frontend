import "../App.css";

export default function NotificationSidebarCard({thisNotification , subject , message , opened , createdAt , percentTop , functionToCall}){
    let subjectTrimmed = subject.substring(0, 20);
    if(subjectTrimmed.length < subject.length)
    {
        subjectTrimmed = subjectTrimmed + '...';
    }
    if(opened)
    {
        return (
            <button onClick={async () => await functionToCall(thisNotification)} style={{width: 408, height: 100, top: percentTop, background: 'hsl(0, 0.00%, 100.00%)', borderRadius: 10, border: '1px solid black'}}>
                <div style={{width: 280 , top: -25, left: -7, position: 'relative', fontFamily: 'IBM Plex Sans', textAlign: 'left', fontSize: 20, fontWeight: '700', color: 'black', wordWrap: 'break-word', padding: 10}}>{subjectTrimmed}</div>
            </button>
        );
    }
    else
    {
        return (
            <button onClick={async () => await functionToCall(thisNotification)} style={{width: 408, height: 100, top: percentTop, background: 'hsl(0, 0.00%, 100.00%)', borderRadius: 10, border: '1px solid black'}}>
                <div style={{width: 280 , top: -15, left: -7, position: 'relative', fontFamily: 'IBM Plex Sans', textAlign: 'left', fontSize: 20, fontWeight: '700', color: 'black', wordWrap: 'break-word', padding: 10}}>{subjectTrimmed}</div>
                <div style={{width: 20 , height: 20 , backgroundColor: '#0b94a1' , position:'relative',  borderRadius: 9999 , top: -50, left: 370}} />
            </button>
        );
    }
}