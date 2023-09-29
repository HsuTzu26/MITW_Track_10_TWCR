const axios = require("axios");
const LongFormfullURL = require("./LongForm/storedfullUrl.json");
const ShortFormfullURL = require("./ShortForm/storedfullUrl.json");

const Lorex = "https://hapi.fhir.tw/fhir/"; //Lorex
const internal1 = "http://152.38.3.102:8080/fhir/"; //內網1
const internal2 = "http://152.38.3.103:4180/fhir/"; //內網2
const internal3 = "http://152.38.3.250:8080/fhir/"; //內網3
const Burni = "http://localhost:8080/";

const fhirServer = internal3;

// console.log(storedfullURL[0]);

async function GET(url) {
    try {
        const res = await axios.get(url);
        // console.log(res.status);

        return res.status;
    } catch (e) {
        console.log(e.response.data);

        return e.response.data;
    }
}

async function executeReq(fullURL) {
    let results = await Promise.all(fullURL.map(url => GET(url)))

     // Count the returned values
    let counts = {};
    for (let result of results) {
        counts[result] = (counts[result] || 0) + 1;
    }

    console.log(counts); // This will display the counts of each returned value
}

(async () =>{
    executeReq(ShortFormfullURL);
    executeReq(LongFormfullURL);
})()