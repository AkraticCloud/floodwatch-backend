//router module for db queries other than authentication

const con = require("../database/client")
const express = require('express')
const router = express.Router()

router.get('/userData',(req,res)=> {
   try{
      const query = `SELECT stateid,countyid, latitude,longitude, rp_elevation, unit, gagheight, isflodding, active 
                     FROM floodWatch_prototype.usersaveddata 
                     WHERE userId = 
                        (SELECT id 
                        FROM floodWatch_prototype.usertable 
                        WHERE username = $1)`
   }catch{ res.status(500).send("internal Error") }
})


//POST route for flood risk data from USGS rtfi API
router.post('/saveUserFloodData', (req,res)=>{
   const{userid,value} = req.body
   const insertQuery = `INSERT INTO floodwatch_prototype.usersaveddata 
                        (id, sitename, stateid, countyid, latitude,longitude, rp_elevation,unit,gageheight,isflooding,active)
                        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                        ON CONFLICT (id) DO UPDATE SET
                           sitename = EXCLUDED.sitename,
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

   con.query(insertQuery,[id,value], (err,result) => {
      if(err){ res.status(500).send(err) } 
      else{
         console.log(result)
         res.status(201).send("Data Recieved, posting to database")
      }
   })
})

router.get("/nearestReferencePoint", (req,res) =>{
   //We'll use the Haversine formula for calculating distance on spherical object (Since the Earth is a sphere)


})
module.exports = router