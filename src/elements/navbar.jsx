import '../App.css';
import usericon from '../images/user-icon.svg';
import notificationicon from '../images/notification-icon.svg';
import giupooling from '../images/giupooling.png';
import { Link } from 'react-router-dom';
export default function Navbar() {
  return (
    <div style={{width: '100%', height: 80, left: 0, top: 0, position: 'absolute', background: 'black'}}>
    <ul style={{listStyleType: 'none'}}>
        <li style={{width: 120, height: 120, left: 58, top: 10, position: 'absolute', background: 'black', borderRadius: 9999}}>
            <img style={{width: 90, height: 90, left: 15, top: 20, position: 'absolute'}} src={giupooling} />  
        </li>
        <li style={{width: 107, height: 43, left: '20%', top: '32%', position: 'absolute', color: 'white', fontSize: 25, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>
            <Link to="/" style={{textDecoration: 'none' , color: 'inherit'}}>Home</Link>
        </li>
        <li style={{width: 189, height: 43, left: '45%', top: '32%', position: 'absolute', color: 'white', fontSize: 25, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>
            <Link to="/dashboard" style={{textDecoration: 'none' , color: 'inherit'}}>Dashboard</Link>
        </li>
        <li style={{width: 127, height: 43, left: '75%', top: '32%', position: 'absolute', color: 'white', fontSize: 25, fontFamily: 'IBM Plex Sans', fontWeight: '700', wordWrap: 'break-word'}}>
            <Link to="/book" style={{textDecoration: 'none' , color: 'inherit'}}>Book</Link>
        </li>
        <li style={{width: 45, height: 45, left: '90%', top: '25%', position: 'absolute'}}>
            <img style={{width: 45, height: 45, position: 'absolute'}} src={usericon} />
        </li>
        <li style={{width: 45, height: 45, left: '95%', top: '22%', position: 'absolute'}}>
            <img style={{width: 45, height: 45, position: 'absolute'}} src={notificationicon} />
        </li>
    </ul>
    </div>
  );
}