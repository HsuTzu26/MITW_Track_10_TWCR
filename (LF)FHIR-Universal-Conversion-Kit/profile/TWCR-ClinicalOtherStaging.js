const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    name: "TWCR-ClinicalOtherStaging",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-clinical-other-staging-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-clinical-other-staging-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-ClinicalOtherStaging"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-clinical-other-staging-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "registered", // registered | preliminary | final | amended
        code: {
            coding: [
                {
                    system: "https://loinc.org",
                    code: "21908-9",
                    display: "Stage group.clinical Cancer",
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
        target: "Observation.id",
        beforeConvert: (data) => {
            return `TWCR-ClinicalOtherStaging-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //其他分期系統期別（臨床分期）
        source: "PTGOSSG",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            let valueCodeableConcept = JSON.parse(`
            {
            "coding" : [
                {
                "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-clinical-other-staging-codesystem",
                "code" : "0000",
                "display" : "無使用其他分期系統"
                }
            ],
            "text" : "0000"
            }
            `);
            valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-clinical-other-staging-codesystem.json", data);
            valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
    // {
    //     source: "CosVstr",
    //     target: "Observation.valueString",
    //     beforeConvert: (data) => {
    //         let str = data.toString();
    //         return str;
    //     },
    // },
    {
        //其他分期系統
        source: "OTHSTG",
        target: "Observation.method",
        beforeConvert: (data) => {
            let method = JSON.parse(`
            {
                "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-other-staging-system-codesystem",
                      "code" : "00",
                      "display" : "無其他分期系統"
                    }
                  ]
            }
            `);
            method.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-other-staging-system-codesystem.json", data);
            method.coding[0].display = displayValue;

            return method;
        },
    },
];
