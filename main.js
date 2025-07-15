const {Client} = require('pg')
const express = require('express')

require('dotenv').config()
const app = express()
app.use(express.json({limit: '10mb'})) //Limit size of JSON to prevent data flooding from clients

//Listing the required variable for creating a connecting to the PostgreSQL database
const con = new Client({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
})


async function fetchDataset(){
   // TODO: Initialize x-api-key header for authorized use of dataset
   try{
      const response = await fetch(`https://api.nationalflooddata.com/v3/data`) //Based on the endpoint provided by FEMA Flood Map API documentation

      if(!response.ok) throw new Error("Could not fetch requested resource");
      const data = await response.json();
   
   } 
   catch(error){
      console.error();
   }
}

//Establishes connection to database
con.connect().then(()=> console.log("Successfully connected to the database"))

//POST route for flood risk data from OpenFEMP API
app.post('/postFloodData',(req,res)=>{
   const{id,value} = req.body
   const insert_query = 'insert into FloodRisks (id,value) values ($1,$2)' //Dummy query, will change with appropriate values

   con.query(insert_query,[id,value], (err,result) => {
      if(err){
         res.send(err)
      } else{
         console.log(result)
         res.send("Data Recieved, posting to database")
      }
   })
})

//Starts node.js server
app.listen(process.env.SERVER_PORT,()=>{console.log(`Server is listening on port ${process.env.SERVER_PORT}`)})