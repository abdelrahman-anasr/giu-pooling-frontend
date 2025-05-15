import "../App.css";
import tick from '../images/tick.svg';

export default function TickButton({label , value , setValue , topPosition , leftPosition}) {
    if(!value)
    {
        return (
            <div style={{left: leftPosition, top: topPosition, position: 'absolute'}}>
                <h1 style={{width: 200 , height: 0, left: 0, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400'}}>{label}</h1>
                <button onClick={() => {setValue(true)}} style={{width: 20, height: 20, left: 200, top: 22, position: 'absolute' , border: '2px black solid'}}></button>
            </div>
        );
    }
    else
    {
        return (
            <div style={{left: leftPosition, top: topPosition, position: 'absolute'}}>
                <h1 style={{width: 200 , height: 0, left: 0, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400'}}>{label}</h1>
                <button onClick={() => {setValue(false)}} style={{width: 20, height: 20, left: 200, top: 22, position: 'absolute' , border: '2px black solid'}}>
                    <img style={{width: 20, height: 20, left: -2, top: -3, position: 'absolute'}} src={tick} />
                </button>
            </div>
        );
    }

    
 }