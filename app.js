const bcrypt = require('bcrypt')
const con = require('./database/client')
const express = require('express')

require('dotenv').config()


// #TODO: Improve File structure for readability and concision

const app = express()

const routes = require('./routes')
app.use ("/", routes)

const PORT = process.env.SERVER_PORT

app.use(express.json({limit: '10mb'})) //Limit size of JSON to prevent data flooding from clients, subject to change with the size of external api data





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

//POST route for flood risk data from OpenFEMP API
app.post('/saveUserFloodData',(req,res)=>{
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

//test route for verifying bcrypt functionality
app.post('/register/test', async (req,res)=> {
   try{
      const salt = await bcrypt.genSalt()
      const hash = await bcrypt.hash(req.body.password, 10)
      console.log(salt)
      console.log(hash)
      res.status(200).send("Password was hashed and can be stored")
   } catch{res.status(500).send("Internal error")}

})



// Test for ensuring bcrypt can authenticate passwords
app.post('/login/test', async(req,res)=>{
   
})





//GET route for sending data points already saved by user to post on map
app.get('/getUserSavedData',(req,res)=> {

})

//Establishes connection to database
con.connect()
.then(()=> console.log("Successfully connected to the database"))
.catch(err => console.error('Connection error' , err.stack))

//Starts node.js server
app.listen(PORT,()=>{console.log(`Server is listening on port ${PORT}`)})