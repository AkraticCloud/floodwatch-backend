
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

//Function when receiving HTTP GET request with appropriate link
//app.get('/data', )

//Starts node.js server

app.listen(process.env.SERVER_PORT,()=>{console.log(`Server is listening on port ${process.env.SERVER_PORT}`)})