import '../App.css';


export default function ChoiceBar({isChoice , setChoice , firstOption , secondOption , pixelsFromTop}) {

    if(isChoice)
    {
        return (
            <div style={{width: 1072, height: 98, left: '15%', top: pixelsFromTop, position: 'absolute', background: 'white', border: '4px black solid'}}>
                <div style={{width: 430, height: 72, left: '1.8%', top: '11%', position: 'absolute', background: '#32ADE6'}} /> 
                <button style={{ background: 'none' , border: 'none' , textDecoration: 'none' , width: 430, height: 46, left: '1.8%', top: '20%', position: 'absolute', textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>{firstOption}</button>
                <button onClick={() => {setChoice(false)}} style={{ background: 'none' , border: 'none' , width: 430, height: 46, left: '55%', top: '20%', position: 'absolute', textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>{secondOption}</button>
            </div>
        );
    }
    else
    {
        return (
            <div style={{width: 1072, height: 98, left: '15%', top: pixelsFromTop, position: 'absolute', background: 'white', border: '4px black solid'}}>
                <div style={{width: 430, height: 72, left: '55%', top: '11%', position: 'absolute', background: '#32ADE6'}} /> 
                <button onClick={() => {setChoice(true)}} style={{ background: 'none' , border: 'none' , textDecoration: 'none' , width: 430, height: 46, left: '1.8%', top: '20%', position: 'absolute', textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>{firstOption}</button>
                <button style={{ background: 'none' , border: 'none' , width: 430, height: 46, left: '55%', top: '20%', position: 'absolute', textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'IBM Plex Sans', fontWeight: '600', wordWrap: 'break-word'}}>{secondOption}</button>
            </div>
        );
    }
}