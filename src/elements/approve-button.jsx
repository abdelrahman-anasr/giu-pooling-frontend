import "../App.css";

export default function ApproveButton({label , size , functionToCall , topPosition , leftPosition}) {
    if(size === 'small')
    {
        return (
            <button className='approve-button' onClick={() => {functionToCall()}} style={{width: 160, height: 61, left: leftPosition, top: topPosition, position: 'absolute'}}>
            <div style={{width: 80, height: 20, left: 40, top: 18, position: 'absolute', color: '#111010', fontSize: 20, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word' , textAlign: 'center'}}>{label}</div>
            </button>
        );
    }
    else if(size === 'large')
    {
        return ( 
            <button className='approve-button' onClick={() => {functionToCall()}} style={{width: 250, height: 61, left: leftPosition, top: topPosition, position: 'absolute'}}>
                <div style={{width: 120, height: 33, left: 66, top: 13, position: 'absolute', color: '#111010', fontSize: 25, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word' , textAlign: 'center'}}>{label}</div>
            </button>
        );
    }
    else if(size === 'pay')
    {
        return ( 
            <button className='approve-button' onClick={() => {functionToCall()}} style={{width: 250, height: 61, left: leftPosition, top: topPosition, position: 'absolute'}}>
                <div style={{width: 160, height: 33, left: 47, top: 16, position: 'absolute', color: '#111010', fontSize: 25, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word' , textAlign: 'center'}}>{label}</div>
            </button>
        );
    }
 }