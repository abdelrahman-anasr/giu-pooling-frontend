import "../App.css";

export default function ComplaintCard({subject , message , createdAt , percentTop , percentLeft}) {
    return (
        <div style={{width: 873.41, display: 'flex', flexDirection: 'column', gap: '2vh' , overflowY: 'auto', height: 238, left: '8%', top: percentTop + '%' , position: 'absolute', background: 'white', borderRadius: 20, border: '4px black solid'}}>
            <div style={{width: 768.20, height: 53, left: '2%', top: '5%', position: 'absolute', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>{subject}</div>
            <div style={{width: 800, height: 28, left: '2%', top: '30%', position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>{message}</div> 
        </div> 
    );
}