const {Client, Result} = require('pg')

require('dotenv').config()

//Listing the required variable for creating a connection to the PostgreSQL database
const con = new Client({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
})

module.exports = con