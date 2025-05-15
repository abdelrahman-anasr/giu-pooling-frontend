import "../App.css";
import arrow from '../images/arrow.svg';

export default function DropdownForForm({ label , open, value, items, setOpen, setValue , topPosition , leftPosition }) {
    console.log("Items are:" , items);
    const itemsArray = [];
    for(let i = 0; i < items.length; i++)
    {
        itemsArray.push(items[i].value);
    }
    const currentLabel = itemsArray.includes(value) ? items.find(item => item.value === value).label : value;
    const length = items.length * 45;
    if(!open)
    {
        return (
            <div style={{left: leftPosition, top: topPosition, position: 'absolute'}}>
            <div style={{width: 340, height: 28, left: 0, top: -35, position: 'absolute', color: 'black', fontSize: 25, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{label}</div>
            <button onClick={() => {setOpen(true)}} style={{width: 340, height: 40, left: '0%', top: '0%', position: 'absolute', background: 'white', border: '1px black solid' , borderRadius: 10}}> 
            <div style={{ left: 5, top: 5, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400'}}>{currentLabel}</div>
            <div style={{width: 40, height: 40, left: 280, top: 9, position: 'absolute'}}>
                <img style={{width: 40, height: 40, left: 12.93, top: -10 , position: 'absolute'}} src={arrow} />
            </div>
            </button>
            </div>
        );
    }
    else
    {
        return (
            <div style={{left: leftPosition, top: topPosition, position: 'absolute'}}>
                <div style={{width: 340, height: 28, left: 0, top: -35, position: 'absolute', color: 'black', fontSize: 25, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{label}</div>
                <button onClick={() => {setOpen(false)}} style={{width: 340, height: 40, left: '0%', top: '0%', position: 'absolute', background: 'white', border: '1px black solid' , borderRadius: 10}}> 
                <div style={{left: 5, top: 5, position: 'absolute', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{currentLabel}</div>
                <div style={{width: 40, height: 40, left: 280, top: 9, position: 'absolute'}}>
                    <img style={{width: 40, height: 40, left: 12.93, top: -10 , position: 'absolute'}} src={arrow} />
                </div>
                </button>
                <div style={{width: 339, height: length, left: 0, top: 40, position: 'absolute', background: 'white', border: '1px black solid', zIndex: 1}}>
                    {items.map((item , index) => {
                        return (
                            <button onClick={() => {setValue(item.value); setOpen(false)}} style={{width: 336, height: 45, left: 0, top: index * 45, position: 'absolute', background: 'white', border: 'none' , fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400', wordWrap: 'break-word'}}>{item.label}</button>
                        );
                    })}
                </div>
            </div>
        );
    }
}