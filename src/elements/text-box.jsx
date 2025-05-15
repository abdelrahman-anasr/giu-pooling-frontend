import "../App.css";

export default function TextBox({label , value , setValue , leftPosition , topPosition})
{
    return (
        <div style={{width: 430, height: 36, left: leftPosition, top: topPosition, position: 'absolute' , background: 'white' , color: 'black', fontSize: 25, fontFamily: 'IBM Plex Sans', wordWrap: 'break-word' , border: '0px'}}>
            {label}
            <input type="text" style={{width: 430, height: 36, left: -3, top: 35, position: 'absolute' , background: 'white' , color: 'black', fontSize: 25, fontFamily: 'IBM Plex Sans', wordWrap: 'break-word' , border: '1px black solid', borderRadius: 10}} value={value} onChange={(e) => {setValue(e.target.value)}} />
        </div>
    );
}