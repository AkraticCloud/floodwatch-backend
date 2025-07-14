const {Client} = require('pg')
const express = require('express')

require('dotenv').config()
const app = express()
app.use(express.json())


//Listing the required variable for creating a connecting to the PostgreSQL database
const con = new Client({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
})


async function fetchData(){
   
   try{
      //const version
      //const entity
      //const response = await fetch(`https://www.fema.gov/api/open/${version}/${entity}`) //Based on the endpoint provided by OpenFEMA API documentation

      if(!response.ok) throw new Error("Could not fetch requested resource");
      const data = await response.json();
   
   } 
   catch(error){
      console.error();
   }
}

//Establishes a connection
con.connect().then(()=> console.log("Successfully connected to the database"))

//Function when receiving a post request with appropriate link
app.post('/post',(req,res)=>{
   const{id,value} = req.body
   const insert_query = 'insert into demotable (id,value) values ($1,$2)'

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