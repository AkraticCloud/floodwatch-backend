//router module for db queries other than authentication

const con = require("../database/client")
const express = require('express')
const toGeoJSON = require('../utility/toGeoJSON')
const router = express.Router()

// Get route for retrieving user saved data, we only require username in the request to perform
router.get('/userData',(req,res)=> {
   try{
      const query = `SELECT id, sitename, stateid, countyid, latitude, longitude, rp_elevation, unit, gageheight, isflooding, active, dateSaved
                     FROM floodWatch_prototype.usersaveddata 
                     WHERE userId = 
                        (SELECT id 
                        FROM floodWatch_prototype.usertable 
                        WHERE username = $1)`
      
      con.query(query, [req.body.username], (err,result)=> {
         if(err) {
            console.log("SQL Error: " + err)
            res.status(500).send("Internal Error")
         }
         else{
            res.status(200).send(toGeoJSON(result.rows))
         }
      })
   }catch{ res.status(500).send("internal Error") }
})

/*
   Since the usersavaddata table is a collection of all user's saved data, we can reference the id (the table's Primary Key) in this format
   {
      "id": value here
   }
*/
router.delete('/userData', (req,res) =>{
   try{
      const query = `DELETE FROM floodwatch_prototype.usersaveddata WHERE id = $1`

      con.query(query,[req.body.id], (err,result)=>{
         if(err){
            console.log("SQL Error: " + err)
            res.status(500).send("Error occurred while deleting")
         }
         else res.status(200).send("Data deleted")
      })
   }catch{ res.status(500).send("Internal Error") }
})

/*
   POST route for flood risk data from USGS rtfi API 
   
   For this route to work, the request must contain all values provided by the reference point and the user's id in the format:
   {
      username: ,
      stateid: ,
      countyid: ,
      latitude: ,
      longitude: ,
      rp_elevation: ,
      unit: ,
      gageheight: ,
      isflooding: ,
      active:
   }
   If the value is not provided, enter null for consistency.
   For the lat and lon values, either enter the value of the user or reference point
*/
router.post('/userData', (req,res)=>{
   const{username,sitename,stateid,countyid,latitude,longitude,rp_elevation,unit,gageheight,isflooding,active} = req.body
   
   const userid = con.query `SELECT id 
                             FROM floodWatch_prototype.usertable 
                             WHERE username = ${username}`
   
   const insertQuery = `INSERT INTO floodwatch_prototype.usersaveddata 
                        (userid, sitename, stateid, countyid, latitude, longitude, rp_elevation, unit, gageheight, isflooding, active)
                        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                        ON CONFLICT (userid, sitename) DO UPDATE 
                        SET
                           stateid = EXCLUDED.stateid,
                           countyid = EXCLUDED.countyid,
                           latitude = EXCLUDED.latitude,
                           longitude = EXCLUDED.longitude,
                           rp_elevation = EXCLUDED.rp_elevation,
                           unit = EXCLUDED.unit,
                           gageheight = EXCLUDED.gageheight,
                           isflooding = EXCLUDED.isflooding,
                           active = EXCLUDED.active,
                           datesaved = now()`

   con.query(insertQuery,[userid,sitename,stateid,countyid,latitude,longitude,rp_elevation,unit,gageheight,isflooding,active], (err,result) => {
      if(err){ res.status(500).send(err) } 
      else{
         console.log(result)
         res.status(201).send("Data Recieved, posting to database")
      }
   })
})

/*
   GET route for retrieving the nearest reference point in the api dataset 
   For this route, we need the request to contain a coordinate pair in json body in the format:
   {
      "lat": $1,
      "lon": $2
   }
*/
router.post("/nearestReferencePoint", (req,res) =>{
   //The database includes the haversine function, which will be used to calculate the distance 
   // between a user's coordinate pair and the reference points to find the closest one to display info from.
   
   //Returns the closest reference point
   const query = `SELECT * 
                  FROM floodwatch_prototype.apidata
                  ORDER BY floodwatch_prototype."HaversineDistance"(
                     latitude,
                     $1,
                     longitude,
                     $2
                  ) ASC
                  LIMIT 1;`
   
   con.query(query, [req.body.lat,req.body.lon], (err, result) =>{
      if(err) res.status(500).send("Internal error")
      else{
         console.log(result.rows[0])
         res.status(200).send(toGeoJSON(result.rows[0]))
      }
   })
})
module.exports = router