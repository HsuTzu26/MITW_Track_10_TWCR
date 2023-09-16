const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");

//GradeClinical
module.exports.profile = {
    name: "TWCR-GradeClinical",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};

// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-grade-clinical-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-grade-clinical-profile.profile.json.html
module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-GradeClinical"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-grade-clinical-profile"],
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

//GradeClinical
module.exports.fields = [
    {
        source: "id",
        target: "Observation.id",
        beforeConvert: (data) => {
            return `TWCR-GradeClinical-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        // 臨床分級/分化	CISTCR32
        source: "CISTCR31",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            //1-5.9,L.H.M.S.X.A-E
            let valueCodeableConcept = JSON.parse(`
      {
        "coding" : [
          {
            "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/grade-clinical-codesystem",
            "code" : "code",
            "display" : "displayValue"
          }
        ]
      }
      `);
            data = String(data).toUpperCase(); //其CodeSystem定義值均為大寫字母
            // https://mitw.dicom.org.tw/IG/TWCR_SF/ValueSet-grade-clinical-valueset.html

            valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-grade-clinical-codesystem.json", data);
            valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
];
