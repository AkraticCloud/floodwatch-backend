//Router module for handling subrouting

const express = require('express')

const rootRoutes = require('./root.js')
const userRoutes = require('./userroutes.js')
const apiRoutes = require('./APIroutes.js')
const dbRoutes = require('./DBroutes.js')

const router = express.Router()

router.use("/", rootRoutes)
router.use("/user", userRoutes)
router.use("/api", apiRoutes)
router.use("/db", dbRoutes)

module.exports = router
