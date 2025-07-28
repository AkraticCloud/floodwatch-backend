const fetchAPIData = require("./referencePointService")
const cron = require("node-cron")

//Execute when server starts running
console.log("Executing inital fetch")
fetchAPIData().then(() => console.log("Fetch Complete"))

//Executes every 30 minutes, since that's how frequently USGS updates reference data
cron.schedule('*/30 * * * *', ()=>{
   console.log("Updating API data")
   fetchAPIData().then(() => console.log("Update Complete"))
})
