const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-OtherRT",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-other-rt-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-other-rt-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-OtherRT"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-other-rt-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", //preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
        category: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-procedure-code-codesystem",
                    code: "OtherRT",
                    display: "其他放射治療",
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
            return `TWCR-OtherRT-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //其他放射治療儀器
        source: "ORTMOD",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let ORTMODCode = JSON.parse(`
            {
              "coding" : [
                {
                  "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-other-rt-modality-codesystem",
                  "code" : "0",
                  "display" : "No Other RT 無其他特殊放射治療"
                }
              ]
            }
            `);
            ORTMODCode.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-other-rt-modality-codesystem.json", data);
            ORTMODCode.coding[0].display = displayValue;

            return ORTMODCode;
        },
    },
    // {
    //   source: "OTHERRT",
    //   target: "Procedure.extension",
    //   beforeConvert: (data) => {
    //     let OTHERRT = JSON.parse(`
    //     [
    //       {
    //         "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-other-rt-technique-extension",
    //         "valueCodeableConcept" : {
    //           "coding" : [
    //             {
    //               "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-other-rt-technique-1-codesystem",
    //               "code" : "0",
    //               "display" : "No Other RT 無其他特殊放射治療"
    //             }
    //           ]
    //         }
    //       },
    //       {
    //         "extension" : [
    //           {
    //             "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-target-of-other-rt-extension",
    //             "valueCodeableConcept" : {
    //               "coding" : [
    //                 {
    //                   "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-target-of-other-rt-codesystem",
    //                   "code" : "0",
    //                   "display" : "No Other RT 無其他特殊放射治療"
    //                 }
    //               ]
    //             }
    //           },
    //           {
    //             "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-dose-to-other-rt-extension",
    //             "valueCodeableConcept" : {
    //               "coding" : [
    //                 {
    //                   "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-dose-to-other-rt-codesystem",
    //                   "code" : "00000",
    //                   "display" : "沒有其他特殊放射治療"
    //                 }
    //               ]
    //             }
    //           },
    //           {
    //             "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-number-of-fractions-to-other-rt-extension",
    //             "valueCodeableConcept" : {
    //               "coding" : [
    //                 {
    //                   "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-number-of-fractions-to-other-rt-codesystem",
    //                   "code" : "00",
    //                   "display" : "沒有其他特殊放射治療"
    //                 }
    //               ]
    //             }
    //           }
    //         ],
    //         "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-other-rt-extension"
    //       }
    //     ]
    //     `)
    //   }
    // }
    {
        //其他放射治療技術
        source: "ORTTEC",
        target: "Procedure.extension",
        beforeConvert: (data) => {
            let orttec = JSON.parse(`            
              {  
                "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-other-rt-technique-extension",
                "valueCodeableConcept" : {
                  "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-other-rt-technique-1-codesystem",
                      "code" : "0",
                      "display" : "No Other RT 無其他特殊放射治療"
                    }
                  ]
                }
              }            
          `);
            orttec.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-other-rt-technique-1-codesystem.json", data);
            orttec.valueCodeableConcept.coding[0].display = displayValue;
            return orttec;
        },
    },
    {
        //	其他放射治療臨床標靶體積
        source: "ORTTECTOCTVH",
        target: "Procedure.extension",
        beforeConvert: (data) => {
            let ORTtoctvh = JSON.parse(`
            "extension":[
            {                
              "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-target-of-other-rt-extension",
              "valueCodeableConcept" : {
                "coding" : [
                  {
                    "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-target-of-other-rt-codesystem",
                    "code" : "0",
                    "display" : "No Other RT 無其他特殊放射治療"
                  }
            ]
          }
            }
          ]
            `);
            ORTtoctvh[0].extension[0].valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-target-of-CTVH-codesystem.json", data);
            ORTtoctvh[0].extension[0].valueCodeableConcept.coding[0].display = displayValue;
            return ORTtoctvh;
        },
    },
    {
        //	其他放射治療臨床標靶體積劑量
        source: "ORTTECDOCTVH",
        target: "Procedure.extension",
        beforeConvert: (data) => {
            let ORTdoctvh = JSON.parse(`
            "extension":[
              {
                "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-dose-to-other-rt-extension",
                "valueCodeableConcept" : {
                  "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-dose-to-other-rt-codesystem",
                      "code" : "00000",
                      "display" : "沒有其他特殊放射治療"
                    }
                  ]
                }
            }
          ]
            `);
            ORTdoctvh[0].extension[0].valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-dose-to-CTVH-codesystem.json", data);
            ORTdoctvh[0].extension[0].valueCodeableConcept.coding[0].display = displayValue;
            return ORTdoctvh;
        },
    },
    {
        //	其他放射治療臨床標靶體積治療次數
        source: "ORTTECNFOCTVH",
        target: "Procedure.extension",
        beforeConvert: (data) => {
            let ORTnfoctvh = JSON.parse(`
            "extension":[{
              "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-number-of-fractions-to-other-rt-extension",
              "valueCodeableConcept" : {
                "coding" : [
                  {
                    "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-number-of-fractions-to-other-rt-codesystem",
                    "code" : "00",
                    "display" : "沒有其他特殊放射治療"
                  }
                ]
          }
            }]
            `);
            ORTnfoctvh[0].extension[0].valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-number-of-fractions-to-CTVH-codesystem.json", data);
            ORTnfoctvh[0].extension[0].valueCodeableConcept.coding[0].display = displayValue;
            return ORTnfoctvh;
        },
    },
];
