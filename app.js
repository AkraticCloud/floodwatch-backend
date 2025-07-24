const bcrypt = require('bcrypt')
const con = require('./database/client')
const crypto = require('crypto')
const express = require('express')

require('dotenv').config()

const app = express()
app.use(express.json({limit: '10mb'})) //Limit size of JSON to prevent data flooding from clients, subject to change with the size of external api data

const routes = require('./routes')
app.use ("/", routes)

const PORT = process.env.SERVER_PORT

//Establishes connection to database
con.connect()
.then(()=> console.log("Successfully connected to the database"))
.catch(err => console.error('Connection error' , err.stack))

//Starts node.js server
app.listen(PORT,()=>{console.log(`Server is listening on port ${PORT}`)})