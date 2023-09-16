const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

//DrinkingBehavior
module.exports.profile = {
    name: "TWCR-DrinkingBehavior",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};

// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-drinking-behavior-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-drinking-behavior-profile.profile.json.html
module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-DrinkingBehavior"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-drinking-behavior-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "final", // registered | preliminary | final | amended
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

//DrinkingBehavior
module.exports.fields = [
    {
        source: "id",
        target: "Observation.id",
        beforeConvert: (data) => {
            return `TWCR-DrinkingBehavior-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        // 喝酒行為	DRINKBE	valueCodeableConcept
        source: "DRINKBE",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            //000-004,009,999
            let valueCodeableConcept = JSON.parse(`
          {
            "coding" : [
              {
                "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/drinking-behavior-codesystem",
                "code" : "codeValue",
                "display" : "displayValue"
              }
            ]
          }
          `);
            valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-drinking-behavior-codesystem.json", data);
            valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
];
