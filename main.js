import bcrypt from 'bcrypt'
import {Client} from 'pg'
import express from 'express'
import crypto from 'crypto'
import 'dotenv/config'

// #TODO: Improve File structure for readability and concision

const app = express()
const PORT = process.env.SERVER_PORT

app.use(express.json({limit: '10mb'})) //Limit size of JSON to prevent data flooding from clients, subject to change with the size of external api data

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

//POST route for storing newly created user profiles with hashed passwords
app.post(`/register/:user`, async(req,res) =>{
    /* We expect the client to send a JSON in the format:
            {
               name: USER_NAME, 
               password: USER_PASS,
               date: DATE_CREATED
            } 
       with the name field being the username, the password field being the user password, and the date field being the date the profile was created.
    */
   try{
      const id = crypto.randomBytes(16).toString("hex") // Generates a 128-bit value, which will be our users UUID in the database
      
      const salt = await bcrypt.genSalt() // Gererate a salt prefix to our user's password
      const hash = await bcrypt.hash(req.body.password, salt) //Generates a hashed version of user passwords that are compared when users login to ensure security
      console.log(saltRounds) // Logs salt segment
      console.log(hash) // Logs hashed version of user password

      const user = {name : req.body.name, pass: hash}
      const createUserQuery = 'INSERT INTO UserTable (id,username,password,dateCreated) VALUES ($1,$2,$3,$4)' // Insert query for storing user profile info

      con.query(createUserQuery, [id,user.name,user.pass,req.body.date], (err,result) =>{
         if(err){ res.status(500).send("Error occurred while saving user profile") }
         else{
            console.log(result)
            res.status(201).send("User profile created and saved")
         }
      })
   }catch{res.status(500).send("Could not save user profile")}
})

// Test for ensuring bcrypt can authenticate passwords
app.post('/login/test', async(req,res)=>{
   
})

//POST route for loging in user profiles with appropriate login inputs from client
app.post('/login/:username', async(req,res)=> {
   /* Run the assumption the request has a body that contains:
         {
            password: USER_PASS
         }
   */
   try{
      con.query('SELECT salt, password FROM UserTable WHERE username = $1;', [username], async(err,result)=> { // Retrieve the hashed password and the salt prefix
         
         // If the username doesn't exist in the database
         if(result.rows.length === 0) return res.status(404).json({ message: 'User not found' })

         const {salt,pass} = result.rows[0] // Separate destructure the tuple into their respective variables

         if (await bcrypt.compare(salt + req.body.password, pass)) res.status(200).send("Success! Log in approved")
         else res.status(401).send("Incorrect password")
      })
   } catch{ res.status(500).send() }
})

//GET route for sending data points already saved by user to post on map
app.get('/getUserSavedData',(req,res)=> {

})

//Starts node.js server
app.listen(PORT,()=>{console.log(`Server is listening on port ${PORT}`)})