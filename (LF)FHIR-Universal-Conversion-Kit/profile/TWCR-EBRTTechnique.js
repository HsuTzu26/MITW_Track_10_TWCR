const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    name: "TWCR-EBRTTechnique",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-ebrt-technique-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-ebrt-technique-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-EBRTTechnique"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-ebrt-technique-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", //preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
        extension: [
            {
                extension: [
                    {
                        url: "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-target-of-CTV-H-extension",
                        valueCodeableConcept: {
                            coding: [
                                {
                                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-target-of-CTVH-codesystem",
                                    code: "0",
                                    display: "No EBRT 無體外放射治療",
                                },
                            ],
                        },
                    },
                    {
                        url: "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-dose-to-CTV-H-extension",
                        valueCodeableConcept: {
                            coding: [
                                {
                                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-dose-to-CTVH-codesystem",
                                    code: "00000",
                                    display: "沒有體外放射治療",
                                },
                            ],
                        },
                    },
                    {
                        url: "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-number-of-fractions-to-CTV-H-extension",
                        valueCodeableConcept: {
                            coding: [
                                {
                                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-number-of-fractions-to-CTVH-codesystem",
                                    code: "00",
                                    display: "沒有體外放射治療",
                                },
                            ],
                        },
                    },
                ],
                url: "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-CTV-H-extension",
            },
            {
                extension: [
                    {
                        url: "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-target-of-CTV-L-extension",
                        valueCodeableConcept: {
                            coding: [
                                {
                                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-target-of-CTVL-codesystem",
                                    code: "0",
                                    display: "No EBRT 無體外放射治療",
                                },
                            ],
                        },
                    },
                    {
                        url: "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-dose-to-CTV-L-extension",
                        valueCodeableConcept: {
                            coding: [
                                {
                                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-dose-to-CTVL-codesystem",
                                    code: "00000",
                                    display: "沒有體外放射治療，或是有體外放射治療但沒有 CTV_L",
                                },
                            ],
                        },
                    },
                    {
                        url: "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-number-of-fractions-to-CTV-L-extension",
                        valueCodeableConcept: {
                            coding: [
                                {
                                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-number-of-fractions-to-CTVL-codesystem",
                                    code: "00",
                                    display: "沒有體外放射治療，或是有體外放射治療但沒有 CTV_L",
                                },
                            ],
                        },
                    },
                ],
                url: "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-CTV-L-extension",
            },
        ],
        category: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-procedure-code-codesystem",
                    code: "EBRTTechnique",
                    display: "體外放射治療",
                },
            ],
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`,
        },
        encounter: {
            reference: `Encounter/${uuid["TWCR-Encounter"]}`,
        },
    },
};

// Global Preprocessor Hook
// Data will run the following function before we iterate each fields
module.exports.beforeProcess = (data) => {
    checkTWCR();
    // 在開始轉換前檢查TWCR的package是否有更新

    return data;
};

module.exports.fields = [
    {
        source: "id",
        target: "Procedure.id",
        beforeConvert: (data) => {
            return `TWCR-EBRTTechnique-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //	體外放射治療技術
        source: "EBRTT",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let EBRTTCode = JSON.parse(`
            {
              "coding" : [
                {
                  "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-ebrt-technique-codesystem",
                  "code" : "0",
                  "display" : "No EBRT 無體外放射治療"
                }
              ]
            }
            `);
            EBRTTCode.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-ebrt-technique-codesystem.json", data);
            EBRTTCode.coding[0].display = displayValue;

            return EBRTTCode;
        },
    },
    // {
    //     //	最高放射劑量臨床標靶體積
    //     source: "EBRTTTOCTVH",
    //     target: "Procedure.extension",
    //     beforeConvert: (data) => {
    //         let toctvh = JSON.parse(`
    //         [
    //           {
    //           "extension" : [
    //             {
    //               {
    //                 "url" : "EBRTTTOCTVHCode",
    //                 "valueCodeableConcept" : {
    //                   "coding" : [
    //                     {
    //                       "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
    //                       "code" : "codeValue",
    //                       "display" : "displayValue"
    //                     }
    //                   ]
    //                 }
    //               }
    //             }
    //           ]
    //           },
    //           "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-target-of-CTV-H-extension"
    //         ]
    //         `);
    //         toctvh[0].extension[0].valueCodeableConcept.coding[0].code = data;
    //         let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-target-of-CTVH-codesystem.json", data);
    //         toctvh[0].extension[0].valueCodeableConcept.coding[0].display = displayValue;
    //         return toctvh;
    //     },
    // },
    // {
    //     //	最高放射劑量臨床標靶體積劑量
    //     source: "EBRTTDOCTVH",
    //     target: "Procedure.extension",
    //     beforeConvert: (data) => {
    //         let docvth = JSON.parse(`
    //         [
    //           {
    //             "extension":[
    //               {
    //                 {
    //                   "url" : "EBRTTTOCTVHCode",
    //                   "valueCodeableConcept" : {
    //                     "coding" : [
    //                       {
    //                         "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
    //                         "code" : "codeValue",
    //                         "display" : "displayValue"
    //                     }
    //                   ]
    //                 }
    //               }
    //             ],
    //             "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-dose-to-CTV-H-extension"
    //           }
    //         ]
    //         `);
    //         docvth[0].extension[0].valueCodeableConcept.coding[0].code = data;
    //         let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-dose-to-CTVH-codesystem.json", data);
    //         docvth[0].extension[0].valueCodeableConcept.coding[0].display = displayValue;
    //         return docvth;
    //     },
    // },
    // {
    //     //最高放射劑量臨床標靶體積治療次數
    //     source: "EBRTTNFOCTVH",
    //     target: "Procedure.extension",
    //     beforeConvert: (data) => {
    //         let nfoctvh = JSON.parse(`
    //         [
    //           {
    //             "extension":[
    //               {
    //                 "url" : "EBRTTTOCTVHCode",
    //                 "valueCodeableConcept" : {
    //                   "coding" : [
    //                     {
    //                       "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
    //                       "code" : "codeValue",
    //                       "display" : "displayValue"
    //                     }
    //                   ]
    //                 }
    //               }
    //             ],
    //             "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-number-of-fractions-to-CTV-H-extension"
    //           }
    //         ]
    //         `);
    //         nfoctvh[0].extension[0].valueCodeableConcept.coding[0].code = data;
    //         let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-number-of-fractions-to-CTVH-codesystem.json", data);
    //         nfoctvh[0].extension[0].valueCodeableConcept.coding[0].display = displayValue;
    //         return nfoctvh;
    //     },
    // },
    // {
    //     //較低放射劑量臨床標靶體積
    //     source: "EBRTTTOCTVL",
    //     target: "Procedure.CTVL",
    //     beforeConvert: (data) => {
    //         let toctvl = JSON.parse(`
    //         [{
    //             "extension":[
    //               {
    //                 "url" : "EBRTTTOCTVHCode",
    //                 "valueCodeableConcept" : {
    //                   "coding" : [
    //                     {
    //                       "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
    //                       "code" : "codeValue",
    //                       "display" : "displayValue"
    //                     }
    //                   ]
    //                 }
    //               }
    //             ],
    //             "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-target-of-CTV-L-extension"
    //           }]
    //         `);
    //         toctvl[0].extension[0].valueCodeableConcept.coding[0].code = data;
    //         let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-target-of-CTVL-codesystem.json", data);
    //         toctvl[0].extension[0].valueCodeableConcept.coding[0].display = displayValue;
    //         return toctvl;
    //     },
    // },
    // {
    //     //較低放射劑量臨床標靶體積劑量
    //     source: "EBRTTDOCTVL",
    //     target: "Procedure.CTVL",
    //     beforeConvert: (data) => {
    //         let doctvl = JSON.parse(`
    //          "extension":[{
    //             "extension":[
    //               {
    //                 "url" : "EBRTTTOCTVHCode",
    //                 "valueCodeableConcept" : {
    //                   "coding" : [
    //                     {
    //                       "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
    //                       "code" : "codeValue",
    //                       "display" : "displayValue"
    //                     }
    //                   ]
    //                 }
    //               }],

    //             "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-dose-to-CTV-L-extension"
    //           }]
    //         `);
    //         doctvl.extension[0].valueCodeableConcept.coding[0].code = data;
    //         let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-dose-to-CTVL-codesystem.json", data);
    //         doctvl.extension[0].valueCodeableConcept.coding[0].display = displayValue;
    //         return doctvl;
    //     },
    // },
    // {
    //     //較低放射劑量臨床標靶體積治療次數
    //     source: "EBRTTNFCTVL",
    //     target: "Procedure.CTVL",
    //     beforeConvert: (data) => {
    //         let nfctvl = JSON.parse(`
    //         [{
    //             "extension":[
    //               {
    //                 "url" : "EBRTTTOCTVHCode",
    //                 "valueCodeableConcept" : {
    //                   "coding" : [
    //                     {
    //                       "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
    //                       "code" : "codeValue",
    //                       "display" : "displayValue"
    //                     }
    //                   ]
    //                 }
    //               }],

    //             "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-number-of-fractions-to-CTV-L-extension"
    //           }]
    //         `);
    //         nfctvl[0].extension[0].valueCodeableConcept.coding[0].code = data;
    //         let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-number-of-fractions-to-CTVL-codesystem.json", data);
    //         nfctvl[0].extension[0].valueCodeableConcept.coding[0].display = displayValue;
    //         return nfctvl;
    //     },
    // },
];
