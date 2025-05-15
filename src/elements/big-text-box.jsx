import "../App.css";

export default function BigTextBox({ label, value, setValue, leftPosition, topPosition , width , height }) {
  return ( 
    <div style={{width: 600, height: 600, left: leftPosition, top: topPosition, position: 'absolute', color: 'black', fontSize: 20, fontFamily: 'IBM Plex Sans', fontWeight: '700'}}>
        {label}
        <textarea value={value} onChange={e => setValue(e.target.value)} style={{width: width, height: height, left: -2, top: 30 , resize: 'none', position: 'absolute', color: 'black', fontSize: 20, fontFamily: 'IBM Plex Sans', fontWeight: '300'}} /> 
    </div>
  );
}