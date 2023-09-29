const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-PerineuralInvasion",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-perineural-invasion-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-perineural-invasion-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-PerineuralInvasion"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-perineural-invasion-profile"],
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
                    code: "92837-4",
                    display: "Perineural invasion [Presence] in Cancer specimen",
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
            return `TWCR-PerineuralInvasion-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //神經侵襲
        source: "CISTCR33",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            let valueCodeableConcept = JSON.parse(`
            {
                "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-perineural-invasion-codesystem",
                      "code" : "0",
                      "display" : "無神經侵襲"
                    }
                  ]
            }
            `);
            valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-perineural-invasion-codesystem.json", data);
            valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
];
