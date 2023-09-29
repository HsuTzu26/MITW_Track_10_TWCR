const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-LymphVascularInvasion",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-lymph-vascular-invasion-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-lymph-vascular-invasion-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-LymphVascularInvasion"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-lymph-vascular-invasion-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "final", // registered | preliminary | final | amended
        code: {
            coding: [
                {
                    system: "https://loinc.org",
                    code: "59544-7",
                    display: "Lymph-vascular invasion Cancer specimen",
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
            return `TWCR-LymphVascularInvasion-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //淋巴管或血管侵犯
        source: "CISTCR34",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            let valueCodeableConcept = JSON.parse(`
            {
                "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-lymph-vascular-invasion-codesystem",
                      "code" : "0",
                      "display" : "無淋巴管或血管侵犯"
                    }
                  ]
            }
            `);
            valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-lymph-vascular-invasion-codesystem.json", data);
            valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
];
