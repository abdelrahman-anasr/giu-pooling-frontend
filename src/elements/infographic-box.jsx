import "../App.css";

export default function InfographicBox({label , value , leftPosition , topPosition})
{
    return (
        <div style={{left: leftPosition, top: topPosition, position: 'absolute'}}>
        <div style={{width: 340, height: 28, left: 0, top: -40, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{label}</div>
        <div style={{width: 335, height: 55, left: 0, top: 0, position: 'absolute', background: 'white', border: '4px black solid', zIndex: 1}}>
            <div style={{ left: 5, top: 12, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400'}}>{value}</div>
        </div>
        </div>
    );
}