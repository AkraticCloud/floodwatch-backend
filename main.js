import bcrypt from 'bcrypt'
import {Client} from 'pg'
import express from 'express'
import crypto from 'crypto'
import 'dotenv/config'

const app = express()
app.use(express.json({limit: '10mb'})) //Limit size of JSON to prevent data flooding from clients

//Listing the required variable for creating a connection to the PostgreSQL database
const con = new Client({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
})

//Establishes connection to database
con.connect().then(()=> console.log("Successfully connected to the database"))

async function fetchDataSet(){
   // TODO: Initialize x-api-key header for authorized use of dataset
   try{
      const response = await fetch(`https://api.nationalflooddata.com/v3/data`) //Based on the endpoint provided by FEMA Flood Map API documentation

      if(!response.ok) throw new Error("Could not fetch requested resource");
      const data = await response.json();
   } 
   catch(error){console.error()}
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

//POST route for storing newly created user profiles with hashed passwords
app.post(`/createUser`, async(req,res) =>{
   try{
      const id = crypto.randomBytes(16).toString("hex") // Generates a 16 value, which will be our users UUID in the database
      
      const saltRounds = await bcrypt.genSalt() //
      const hash = await bcrypt.hash(req.body.password, saltRounds) //generates a hashed version of user passwords that are compared when users login to ensure security
      console.log(saltRounds) // Logs salt header
      console.log(hash) // Logs hashed version of user password

      const user = {name : req.body.name, pass: hash}
      const createUserQuery = 'INSERT INTO UserTable (id,user,pass) VALUES ($1,$2,$3)' // Insert query for storing user profiles

      con.query(createUserQuery, [id,user.name,user.pass], (err,result) =>{
         if(err){ res.status(500).send("Error occurred while saving user profile") }
         else{
            console.log(result)
            res.status(201).send("User profile created and saved")
         }
      })
   }catch{res.status(500).send("Could not save user profile")}
})

//GET route for sending user profile with appropriate login inputs from client
app.get('/getUser/:userid', async(req,res)=> {

})

//GET route for sending data points already saved by user to post on map
app.get('/getUserSavedData',(req,res)=> {

})

//Starts node.js server
app.listen(process.env.SERVER_PORT,()=>{console.log(`Server is listening on port ${process.env.SERVER_PORT}`)})