//Sample code showing data retrieval
const {Client} = require('pg')
const express = require('express')

const app = express()
app.use(express.json())


//Listing the required variable for creating a connecting to the PostgreSQL database
const con = new Client({
   host:"localhost",
   user:"postgres",
   port: 5432,
   password:"Admins",
   database: "demoPhase"
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
const PORT = process.env.PORT || 8000;

app.listen(PORT,()=>{console.log(`Server is listening on port ${PORT}`)})