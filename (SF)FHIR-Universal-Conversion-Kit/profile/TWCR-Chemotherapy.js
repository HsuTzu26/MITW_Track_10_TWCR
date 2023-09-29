const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    name: "TWCR-Chemotherapy",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_SF/StructureDefinition-chemotherapy-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_SF/Procedure-ChemotherapyExample.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-Chemotherapy"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-sf-chemotherapy-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", // preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
        category: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-procedure-code-codesystem",
                    code: "Chemotherapy",
                    display: "申報醫院化學治療",
                },
            ],
        },
        code: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-chemotherapy-codesystem",
                    code: "01",
                    display: "接受全身性化學治療",
                },
            ],
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`,
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
            return `TWCR-Chemotherapy-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        // 申報醫院化學治療	CHMTF	code
        // 詢問Lily 申報醫院化學治療值集CodeSystem疑似缺少code82
        source: "LFCHMTF",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let code = JSON.parse(`
      {
        "coding" : [
          {
            "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-chemotherapy-codesystem",
            "code" : "codeValue",
            "display" : "displayValue"
          }
        ]
      }
      `);

            code.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-chemotherapy-codesystem.json", data);
            code.coding[0].display = displayValue;

            return code;
        },
    },
    {
        // 申報醫院化學治療開始日期	DCHMSTF	performedPeriod.start
        source: "DCHMSTF",
        target: "Procedure.performedPeriod",
        beforeConvert: (data) => {
            let performed = JSON.parse(`
            {
                "start" : "2020-03-06"
            }
            `);

            let s = String(data);
            let YYYY = s[0] + s[1] + s[2] + s[3];
            let MM = s[4] + s[5];
            let DD = s[6] + s[7];
            performed.start = `${YYYY}-${MM}-${DD}`;

            return performed;
        },
    },
];
