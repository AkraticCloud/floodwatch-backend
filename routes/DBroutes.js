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


//POST route for flood risk data from OpenFEMP API
router.post('/saveUserFloodData',(req,res)=>{
   const{id,value} = req.body
   const insert_query = 'insert into FloodRisks (id,value) values ($1,$2)' //Dummy query, will change with appropriate values

   con.query(insert_query,[id,value], (err,result) => {
      if(err){ res.status(500).send(err) } 
      else{
         console.log(result)
         res.status(201).send("Data Recieved, posting to database")
      }
   })
})

module.exports = router