const con = require('./database/client')
const express = require('express')
const scheduler = require("./utility/scheduler")
const cors = require('cors')

require('dotenv').config()
const PORT = process.env.SERVER_PORT || 8000

const app = express()
app.use(express.json({limit: '10mb'})) //Limit size of JSON to prevent data flooding from clients, subject to change with the size of external api data
app.use(cors())

// Allows access to the routes folders and routes
const routes = require('./routes')
app.use ("/", routes)

//Establishes connection to database
con.connect()
.then(()=> console.log("Successfully connected to the database"))
.catch(err => console.error('Connection error' , err.stack))

//Starts node.js server
app.listen(PORT,()=>{console.log(`Server is listening on port ${PORT}`)})