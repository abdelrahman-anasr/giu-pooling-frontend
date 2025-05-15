import '../App.css';
import filter from '../images/filter-icon.svg';
import BookFilterBox from './book-filter-box';

export default function FilterBox({ filterOpened , setFilterOpened , searchBox , functionToCall , itemsFromTo , setItemsFromTo , fromToValue , setFromToValue , fromToOpened , setFromToOpened , itemsLocation , setItemsLocation , locationValue , setLocationValue , locationOpened , setLocationOpened , girlsOnly , setGirlsOnly , percentLeft , percentTop}) {
    if(!filterOpened)
    {
        return (
            <button className='filter-button' onClick={() => {setFilterOpened(true)}} style={{width: 110, height: 40, left: percentLeft , top: percentTop, position: 'absolute'}}> 
                <div style={{width: 100, height: 40, left: 2, top: 1, position: 'absolute', textAlign: 'left', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400'}}>Filter</div>
                <img style={{width: 25, height: 25, left: 74, top: 5, position: 'absolute'}} src={filter} />
            </button>
        )
    }
    else
    {
        return (
            <>
                <button className='filter-button' onClick={() => {setFilterOpened(false)}} style={{width: 110, height: 40, left: percentLeft , top: percentTop, position: 'absolute'}}> 
                    <div style={{width: 100, height: 40, left: 2, top: 1, position: 'absolute', textAlign: 'left', color: 'black', fontSize: 24, fontFamily: 'IBM Plex Sans', fontWeight: '400'}}>Filter</div>
                    <img style={{width: 25, height: 25, left: 74, top: 5, position: 'absolute'}} src={filter} />
                </button>
                <BookFilterBox zValue={2} functionToCall={functionToCall} itemsFromTo={itemsFromTo} setItemsFromTo={setItemsFromTo} fromToValue={fromToValue} setFromToValue={setFromToValue} fromToOpened={fromToOpened} setFromToOpened={setFromToOpened} itemsLocation={itemsLocation} setItemsLocation={setItemsLocation} locationValue={locationValue} setLocationValue={setLocationValue} locationOpened={locationOpened} setLocationOpened={setLocationOpened} girlsOnly={girlsOnly} setGirlsOnly={setGirlsOnly} leftPosition={230} topPosition={percentTop + 40} />
            </>

            
        );
    }
 }