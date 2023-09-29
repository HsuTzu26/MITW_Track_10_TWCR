const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    name: "TWCR-PalliativeCare",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_SF/StructureDefinition-palliative-care-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_SF/Procedure-PalliativeCareExample.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-PalliativeCare"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-sf-palliative-care-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", //preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
        category: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-procedure-code-codesystem",
                    code: "PalliativeCare",
                    display: "申報醫院緩和照護",
                },
            ],
        },
        code: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-palliative-care-codesystem",
                    code: "0",
                    display: "(1)個案未接受緩和照護 (2)屍體解剖時才診斷為癌症",
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
            return `TWCR-PalliativeCare-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        // 申報醫院緩和照護	PCATF	code
        source: "PCATF",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let code = JSON.parse(`
      {
        "coding" : [
          {
            "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-palliative-care-codesystem",
            "code" : "code",
            "display" : "display"
          }
        ]
      }
      `);
            code.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-palliative-care-codesystem.json", data);
            code.coding[0].display = displayValue;

            return code;
        },
    },
];
