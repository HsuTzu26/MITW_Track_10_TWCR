function getCurrentTimestamp() {
  // https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
  let current_timestamp = Date.now();
  // Create a new JavaScript Date object based on the timestamp
  var date = new Date(current_timestamp);

  var year = date.getFullYear().toString();
  var month = date.getMonth() + 1;
  // https://www.w3schools.com/js/js_date_methods.asp
  if (month < 10) {
    month = "0" + month;
  }
  else month = month.toString();
  var day = date.getDate();
  if (day < 10) {
    day = "0" + day;
  }
  else day = day.toString();
  // Hours part from the timestamp
  var hours = date.getHours().toString();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();
  // Millis part from the timestamp
  var millis = "0" + date.getMilliseconds();

  // Will display time in 20230207-103006-232 format
  var formattedTime = year + month + day + "-" + hours + minutes.substr(-2) + seconds.substr(-2) + "-" + millis.substr(-3);

  // console.log(formattedTime);
  return formattedTime;
}

function makeid(length) {
  // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function genernateTimePlusRandomID() {
  return getCurrentTimestamp() + "-" + makeid(6);
}

const fs = require('fs');
function searchCodeSystemDisplayValue(jsonPath, codeValue) {
  let codeSystem = JSON.parse(fs.readFileSync(jsonPath.toString(), 'utf-8'));

  let concepts = codeSystem.concept;
  let result = "Error-Could_not_find_any_match_displayValue";

  for (let i = 0; i < concepts.length; i++) {
    if (String(concepts[i].code) == String(codeValue)) {
      result = String(concepts[i].display);
      break;
    }
  }

  return result;
}

module.exports.getCurrentTimestamp = getCurrentTimestamp;
module.exports.genernateTimePlusRandomID = genernateTimePlusRandomID;
module.exports.searchCodeSystemDisplayValue = searchCodeSystemDisplayValue;