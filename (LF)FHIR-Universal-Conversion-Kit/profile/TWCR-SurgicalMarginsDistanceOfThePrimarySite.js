const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-SurgicalMarginsDistanceOfThePrimarySite",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-surgical-margins-distance-of-the-primary-site-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-surgical-margins-distance-of-the-primary-site-profile.profile.json.html

https: module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-SurgicalMarginsDistanceOfThePrimarySite"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-surgical-margins-distance-of-the-primary-site-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "final", //registered | preliminary | final | amended +
        value: "125 millimeter", // 125 millimeter | 手術切緣距離≧98mm
        code: {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "81184-4",
                    display: "Distance of tumor from circumferential resection margin [Length] by Microscopy",
                },
            ],
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`
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
            return `TWCR-SurgicalMarginsDistanceOfThePrimarySite-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //原發部位手術切緣距離
        source: "CISTCR39",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            let valueCodeableConcept = JSON.parse(`
            {
                "valueCodeableConcept":{
                    "coding" : [
                        {
                        "system" : "https://mitw.dicom.org.tw/IG/TWCR_LF/CodeSystem-surgical-margins-distance-of-the-primary-site-codesystem.html",
                        "code" : "code",
                        "display" : "display"
                        }
                    ]
                }
            }
            `);
            valueCodeableConcept.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-surgical-margins-distance-of-the-primary-site-codesystem.json", data);
            valueCodeableConcept.valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
];
