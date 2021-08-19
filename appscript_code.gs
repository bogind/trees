function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var range = sheet.getRange("A2:E");
  var values = range.getValues();
  
  var base_object = {
    "type": "FeatureCollection",
    "features": []
  };
  for(var i=0;i<values.length;i++){
    if(values[i][4] === 1){
      var feature = {
      "type": "Feature",
      "properties": {
        "time": values[i][0],
        "type": values[i][1]
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          values[i][2],
          values[i][3]
        ]
      }
    };
    base_object.features.push(feature);
    }
    
  }

  var response = ContentService.createTextOutput(JSON.stringify( base_object));
  response.setMimeType(ContentService.MimeType.JSON);
  return response;  
}

function doPost(e){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var parameters = e.parameter;
  var time = new Date();
  var type = parameters.type ? parameters.type : "unknown"
  var lon = parameters.lon;
  var lat = parameters.lat;
  sheet.appendRow([time,type,lon,lat,0]);
  return ContentService.createTextOutput(200)
}