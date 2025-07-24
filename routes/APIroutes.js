//Route module for retrieving api data

const express = require('express')
const router = express.Router()

async function fetchAPIData(address){
   try{
      const response = await fetch(`https://api.nationalflooddata.com/v3/data`,{
         method: 'GET',
         headers: process.env.FLOOD_RISK_API_KEY,
         params: {
            'address': address,
            'searctype': 'addressparcel',
            'loma': true,
            'evelation': true
         }
      }) //Based on the endpoint provided by FEMA Flood Map API documentation available at https://docs.nationalflooddata.com/dataservice/v3/index.html#operation/getFloodData

      if(!response.ok) throw new Error("Could not fetch requested resource");
      const data = await response.json();
   } 
   catch(error){ console.error() }
}

module.exports = router