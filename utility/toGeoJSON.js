//Utility function to convert json data into GeoJSON format
const GeoJSON = require('geojson')

/*
   Latitude and longitude refer to the columns in the result query (What we primarily use this function for)
   Adhere to normal stated json formatting unless directed otherwise
*/ 

function toGeoJSON(data){
   var newData = GeoJSON.parse(data, {Point:['latitude','longitude']})
   return newData
}

module.exports = toGeoJSON