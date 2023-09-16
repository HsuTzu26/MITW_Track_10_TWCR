// // Example

// function postFUCK(d) {
//     // 抓post 到fuck 後的 result
//     axios.post(FUCK, { d });
//     return result;
// }

// let data = [{ name: "aa" }, { address: aa }];
// let entry = [];
// for (let d of data) {
//     let result = postFUCK(d);
//     entry.push(result);
// }

// let bundle = {
//     resourceType: "Bundle",
//     identifier: "uuid",
//     type: "document",
//     timestamp: "2022-07-12 02:30:00+0800-20230905-145531-797",
//     entry: entry,
// };

// const createBundle = require("./createBundle");
// createBundle.createBundle();



/* 
using fuck entry result to put into bundle
then replace postman to self-definition program
automatically realize POST and create bundle

1.Transform json formation to FHIR formation with F.U.C.K.
(|V|)Short Form Profile
(|V|)Long Form Profile
2.Create Bundle
(|V|)Use axios to post data to F.U.C.K. server
(|V|)Get F.U.C.K. entry result
(|V|)Push into bundle with all profiles => transaction
(| |)Create composition profile and reference
    (|V|)Get all of the profile uuid
    (| |)Create composition profile
    (|V|)Create references
        (|V|)Get all of the profile that has "reference"
(| |)Completely create bundle
    (**Including composition, resources, create references**)
3.POST to cylab FHIR Server
(| |)Check bundle whether meet the FHIR formation
(| |)POST to FHIR Server, be sure no problem

##Additional##
(| |)Create automated F.U.C.K. execution


*/
