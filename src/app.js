const bcrypt = require('bcrypt')
const con = require('../database/client')
const crypto = require('crypto')
const express = require('express')

require('dotenv').config()

const app = express()
const PORT = process.env.SERVER_PORT

app.use(express.json({limit: '10mb'})) //Limit size of JSON to prevent data flooding from clients, subject to change with the size of external api data

const routes = require('../routes')
app.use ("/", routes)

async function fetchAPIData(){
   
   for (let stateId = 1; stateId <= 59; stateId++){
      try{
         const stateData = await fetch(`https://api.waterdata.usgs.gov/rtfi-api/referencepoints/state/${stateId}`, { method: 'GET' }) 
         
         if(!response.ok) throw new Error(`HTTP error: ${response.status}`)
         
         const referencePoints = stateData.map(referencePoint => ({
            id: referencePoint.id,
            sitename: referencePoint.site_name,
            stateid: referencePoint.state_id,
            countyid: referencePoint.county_id,
            latitude: referencePoint.latitude,
            longitude: referencePoint.longitude,
            rp_elevation: referencePoint.rp_elevation,
            unit: referencePoint.unit,
            gageheight: referencePoint.gageheight,
            isflooding: referencePoint.isflooding,
            active: referencePoint.active
         }))

         

      } 
      catch(error){ 
         if(error.message.includes('404')) console.log(`State ${stateId} does not contain reference points. Skipping`)
         else console.log("Fetch Error: " + error.message) 
      }
   }
}


const newData = fetchAPIData()

//Establishes connection to database
con.connect()
.then(()=> console.log("Successfully connected to the database"))
.catch(err => console.error('Connection error' , err.stack))

//Starts node.js server
app.listen(PORT,()=>{console.log(`Server is listening on port ${PORT}`)})