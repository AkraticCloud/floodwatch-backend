//Router module for handling subrouting

const express = require('express')

const userRoutes = require('./userroutes.js')
const dbRoutes = require('./DBroutes.js')

const router = express.Router()

router.use("/", userRoutes)
router.use("/db", dbRoutes)

module.exports = router