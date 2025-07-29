//Utility function to convert json data into GeoJSON format
const GeoJSON = require('geojson')

function toGeoJSON(data){
   var newData = GeoJSON.parse(data, {Point:['latitude','longitude']})
   return newData
}

module.exports = toGeoJSON