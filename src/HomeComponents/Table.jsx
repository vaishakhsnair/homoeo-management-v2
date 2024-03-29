import '../style/table.css'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useBetween } from "use-between";

export var SortToggleStatus = {"id":0,"name":0,"phone":0,"date":0,'nextvisit':0} //index:state 0-unchanged , 1 - asc ,-1 desc
export const columns = [
  { label: "ID", accessor: "id", sortable: true },
  { label: "Name", accessor: "name", sortable: true },
  { label: "Phone", accessor: "phone", sortable: true },
  { label: "Date", accessor: "date", sortable: true },
  { label: "Next Visit On", accessor: "nextvisit", sortable: true },
  { label: "Options", accessor: "options", sortable: false },
];

export var TableData = []

const useTableState = () => {
  const [ data, setdata ] = useState([]);

  return {
    data , setdata
  };
};

const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

const useSharedTableState = () => useBetween(useTableState);

export function Load(){
  const [ data, setdata ] = useState('');

    useEffect(() => {
      axios.post('/api/details', { request:"list" })
      .then(response => {
        response = response.data.data
        if (response.length !== 0){ 
          setdata(response);
          TableData = response  
      }

      })
      .catch(error => {
        console.log(error);
      });
    }, []);

    return fillTablewithData(data,setdata)

}
function handlesortClick(accessor) {
  const currentData = [...TableData]; // Create a copy of TableData to avoid modifying the original array
  if (accessor === "options") {
    return currentData;
  }
  const IndexOfItemToSort = Object.keys(SortToggleStatus).indexOf(accessor);
  console.log(accessor);
  var ItemToSortObject = {};
  currentData.forEach((element) => {
    if (accessor === "date" || accessor === "nextvisit") {
      var isodate = element[IndexOfItemToSort].split("-").reverse();
      isodate[0] = `20${isodate[0]}`;
      isodate = isodate.join("-");
      var date = new Date(isodate);
      if (!ItemToSortObject[date]) {
        ItemToSortObject[date] = [];
      }
      ItemToSortObject[date].push(element);
    } else {
      if (!ItemToSortObject[element[IndexOfItemToSort]]) {
        ItemToSortObject[element[IndexOfItemToSort]] = [];
      }
      ItemToSortObject[element[IndexOfItemToSort]].push(element);
    }
  });

  var orderedkeys;
  switch (SortToggleStatus[accessor]) {
    case 0:
      if (accessor === "date"  || accessor === "nextvisit") {
        orderedkeys = Object.keys(ItemToSortObject).sort(function (a, b) {
          return new Date(a) - new Date(b);
        });
        SortToggleStatus[accessor] = 1;
        break;
      }
      orderedkeys = Object.keys(ItemToSortObject).sort();
      SortToggleStatus[accessor] = 1;
      break;
    case 1:
      if (accessor === "date"  || accessor === "nextvisit") {
        orderedkeys = Object.keys(ItemToSortObject).sort(function (a, b) {
          return new Date(b) - new Date(a);
        });
        SortToggleStatus[accessor] = -1;
        break;
      }
      orderedkeys = Object.keys(ItemToSortObject).sort().reverse();
      SortToggleStatus[accessor] = -1;
      break;
    case -1:
      if (accessor === "date"  || accessor === "nextvisit") {
        orderedkeys = Object.keys(ItemToSortObject).sort(function (a, b) {
          return new Date(a) - new Date(b);
        });
        SortToggleStatus[accessor] = 0;
        break;
      }
      orderedkeys = Object.keys(ItemToSortObject).sort();
      SortToggleStatus[accessor] = 0;
      break;
  }

  const orderedData = orderedkeys.reduce((arr, key) => {
    arr.push(...ItemToSortObject[key]);
    return arr;
  }, []);

  return orderedData;
}
  


function fillTablewithData(datatree,setdata){
  if(datatree === ""){
    return 
  }
  console.log(datatree)
  const search_stuff = <div className='searchstuff'>
                          <div className='searchtext'>Search :</div>
                          <input onChange={e=>{
                                const newdata = Search(e.target.value)
                                setdata(newdata)

                            }} className='searchbar' >
                            
                          </input>
                      </div>
  const headers = columns.map((column) => 
            
              <td className='thitems' onClick={e => {
                const newdata = handlesortClick(column.accessor)
                setdata(newdata)
                TableData = newdata
              } } 
              accessor={column.accessor} >{column.label}</td>
            
            );
        
  
  const contents = datatree.map((items) =>
            <tr className='tablerow'>
              {items.slice(0,4).map((columns)=>
                <td className='column'>{columns}</td>
              )}

              {items[4] === "00-00-00" ? <td className='column'>Not Set</td> : <td className='column'>{items[4]}</td>}
               
                <td className='column'>
                  <div className='optionsbtbox'>
                  <button className='optionsbts' onClick={() => openInNewTab(`/followup?patientno=${items[0]}`)}> Follow Up</button>
                  <button className='optionsbts' onClick={() => openInNewTab(`/details?patientno=${items[0]}`)}>Details</button>

                  </div>

                </td>
            </tr>
            )
        
    

  const table = (
    <div className='tableholder'>
    {search_stuff}
    <table className='table'>
    <tr className='tablehead'>{headers}</tr>
    <tbody>
      {contents}
    </tbody>
  </table>
  </div>
  )
  return (
    table
  )

}

export function Search(value){
  console.log(value)
  if(value === ""){
    return TableData
  }

  const newdata = TableData.filter((item) => {
    return item[0].toLowerCase().includes(value.toLowerCase()) || item[1].toLowerCase().includes(value.toLowerCase()) 
    || item[2] === parseInt(value) || item[3].toLowerCase().includes(value.toLowerCase())
  })
  console.log(newdata)
  return newdata


}