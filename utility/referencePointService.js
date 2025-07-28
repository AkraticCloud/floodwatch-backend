const con = require('../database/client')

async function fetchAPIData(){
   //We want to update the data for each 
   const query = `INSERT INTO floodwatch_prototype.apidata 
                       (id, sitename, stateid, countyid, latitude,longitude, rp_elevation,unit,gageheight,isflooding,active)
                       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                       ON CONFLICT (id) DO UPDATE SET
                           sitename = EXCLUDED.sitename,
                           stateid = EXCLUDED.stateid,
                           countyid = EXCLUDED.countyid,
                           latitude = EXCLUDED.latitude,
                           longitude = EXCLUDED.longitude,
                           rp_elevation = EXCLUDED.rp_elevation,
                           unit = EXCLUDED.unit,
                           gageheight = EXCLUDED.gageheight,
                           isflooding = EXCLUDED.isflooding,
                           active = EXCLUDED.active,
                           datesaved = now()`

   // Loops the request for every state included in the API, this API alphabetizes the states and includes territories. 
   // Some state ids do not have reference points (i.e. D.C., American Somoa, etc.)
   for (let stateId = 1; stateId <= 59; stateId++){ 
      try{
         const res = await fetch(`https://api.waterdata.usgs.gov/rtfi-api/referencepoints/state/${stateId}`, { method: 'GET' }) 
         const stateData = await res.json()
         
         if(res.legnth > 0)
         console.log(`Fetched ${res.length} points for state ${stateId}`)

         //Maps relevant data from each element
         const referencePoints = stateData.map(referencePoint => ({
            id: referencePoint.id,
            sitename: referencePoint.site_name,
            stateid: referencePoint.state_id,
            countyid: referencePoint.county_id,
            latitude: referencePoint.latitude,
            longitude: referencePoint.longitude,
            rp_elevation: referencePoint.rp_elevation,
            unit: referencePoint.unit,
            gageheight: referencePoint.gageheight,
            isflooding: referencePoint.isflooding,
            active: referencePoint.active
         }))

         referencePoints.forEach(referencePoint => {
            con.query(query, [referencePoint.id,referencePoint.sitename,referencePoint.stateid,referencePoint.countyid,
                                   referencePoint.latitude,referencePoint.longitude,referencePoint.rp_elevation,referencePoint.unit,
                                   referencePoint.gageheight,referencePoint.isflooding,referencePoint.active], (err,result)=>{
               if(err){ 
                  console.log("SQL Error: " + err)
                  return 
               }
               console.log("Data has been inserted")
            })
         });
      } 
      catch(error){
         if(error.message.includes('404')) console.log(`State ${stateId} does not contain reference points. Skipping`)
         else console.log(`Fetch Error on state ${stateId}: ` + error.message) 
      }
   }
}

module.exports = fetchAPIData