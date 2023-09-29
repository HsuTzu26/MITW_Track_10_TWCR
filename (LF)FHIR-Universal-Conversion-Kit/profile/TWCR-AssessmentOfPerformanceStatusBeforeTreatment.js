const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    name: "TWCR-AssessmentOfPerformanceStatusBeforeTreatment",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};

// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-asessment-of-performance-status-before-treatment-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-asessment-of-performance-status-before-treatment-profile.profile.json.html
module.exports.globalResource = {
    // Should be resource name
    Condition: {
        id: uuid["TWCR-AssessmentOfPerformanceStatusBeforeTreatment"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-assessment-of-performance-before-treatment-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        // code: {
        //     coding: [
        //         {
        //             system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-assessment-of-performance-before-treatment-codesystem",
        //             code: "100",
        //             display: "KPS=100，ECOG PS=0或ECOG未評估（正常，沒有任何抱怨，確定沒有疾病 / 活動性與生病之前無異，不受疾病影響）",
        //         },
        //     ],
        //     text: "100",
        // },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`,
        },
        encounter: {
            reference: `Encounter/${uuid["TWCR-Encounter"]}`,
        },
        recorder: {
            reference: `Practitioner/${uuid["TWCR-Practitioner"]}`,
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
    //AssessmentOfPerformanceStatusBeforeTreatmentProfile
    {
        source: "id",
        target: "Condition.id",
        beforeConvert: (data) => {
            return `TWCR-AssessmentOfPerformanceStatusBeforeTreatment-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //首次治療前生活功能狀態評估
        source: "CISTCR42",
        target: "Condition.code", //Binding: 首次治療前生活功能狀態評估值集
        beforeConvert: (data) => {
            //000-005,100.104,204.209,,303-304.309,403.409,503.509,602.609,701-702.709,801.809,900-901.909.988.999
            let cistcr_42 = JSON.parse(`
                {
                    "coding" : [
                        {
                          "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-assessment-of-performance-before-treatment-codesystem",
                          "code" : "100",
                          "display" : "KPS=100，ECOG PS=0或ECOG未評估（正常，沒有任何抱怨，確定沒有疾病 / 活動性與生病之前無異，不受疾病影響）"
                        }
                      ],
                      "text" : "100"
                }     
              
              `);
            cistcr_42.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-assessment-of-performance-status-before-treatment-codesystem.json", data);
            cistcr_42.coding[0].display = displayValue;

            return cistcr_42;
        },
    },
];
