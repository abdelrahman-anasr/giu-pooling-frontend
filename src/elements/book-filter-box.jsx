import "../App.css";
import Dropdown from "./dropdown";
import TickButton from "./tick-button";
import ApproveButton from "./approve-button";

export default function BookFilterBox({zValue , itemsFromTo , setItemsFromTo , fromToValue , setFromToValue , fromToOpened , setFromToOpened , itemsLocation , setItemsLocation , locationValue , setLocationValue , locationOpened , setLocationOpened , girlsOnly , setGirlsOnly , functionToCall , leftPosition , topPosition}) {
    return (
        <div style={{width: 1060, height: 490, zValue: zValue , left: leftPosition, top: topPosition, position: 'absolute', background: '#EDEDED', border: '10px black solid'}}>
            <Dropdown label={"From/To GIU"} items={itemsFromTo} setItems={setItemsFromTo} value={fromToValue} setValue={setFromToValue} open={fromToOpened} setOpen={setFromToOpened} topPosition={50} leftPosition={30} />

            <Dropdown label={"Location"} items={itemsLocation} setItems={setItemsLocation} value={locationValue} setValue={setLocationValue} open={locationOpened} setOpen={setLocationOpened} topPosition={50} leftPosition={630} />

            <TickButton label={"Girls-Only Ride"} value={girlsOnly} setValue={setGirlsOnly} topPosition={200} leftPosition={30} />

            <ApproveButton label={"Search"} size={'large'} functionToCall={functionToCall} topPosition={400} leftPosition={720} />
        </div>
    );
}