const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-SurgicalMarginsOfThePrimarySite",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-surgical-margins-of-the-primary-site-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-surgical-margins-of-the-primary-site-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-SurgicalMarginsOfThePrimarySite"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-surgical-margins-of-the-primary-site-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "final", //registered | preliminary | final | amended +
        code: {
            coding: [
                {
                    system: "https://loinc.org",
                    code: "21939-4",
                    display: "Surgical margins cancer involvement",
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
            return `TWCR-SurgicalMarginsOfThePrimarySite-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //原發部位手術邊緣
        source: "SMTPS",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            let valueCodeableConcept = JSON.parse(`
            {
                "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-surgical-margins-of-the-primary-site-codesystem",
                      "code" : "1",
                      "display" : "有殘存的侵襲性癌細胞，其他更詳細的情形則不清楚"
                    }
                  ]
            }
            `);
            valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-surgical-margins-of-the-primary-site-codesystem.json", data);
            valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
];
