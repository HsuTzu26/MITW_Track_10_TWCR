const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    name: "TWCR-HematologicTransplantEndocrineProcedure",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-hematologic-transplant-endocrine-procedure-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-hematologic-transplant-endocrine-procedure-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-HematologicTransplantEndocrineProcedure"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-hematologic-transplant-endocrine-procedure-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", //preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
        category: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-procedure-code-codesystem",
                    code: "HematologicTransplantAndEndocrineProcedure",
                    display: "骨髓/幹細胞移植或內分泌處置",
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
            return `TWCR-HematologicTransplantEndocrineProcedure-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //骨髓/幹細胞移植或內分泌處置
        source: "HTAEP",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let htaepCode = JSON.parse(`
            {
                "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-hematologic-transplant-and-endocrine-codesystem",
                      "code" : "10",
                      "display" : "有骨髓移植，但病歷上未註明是自體骨髓移植或是異體骨髓移植"
                    }
                  ]
            }
            `);
            htaepCode.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-hematologic-transplant-and-endocrine-codesystem.json", data);
            htaepCode.coding[0].display = displayValue;

            return htaepCode;
        },
    },
    {
        //申報醫院骨髓/幹細胞移植或內分泌處置開始日期
        source: "DHTEPS",
        target: "Procedure.performedPeriod",
        beforeConvert: (data) => {
            let perDateTime = JSON.parse(`
            {
                "start" : "2019-02-22"
            }
            `);

            let s = String(data);
            let YYYY = s[0] + s[1] + s[2] + s[3];
            let MM = s[4] + s[5];
            let DD = s[6] + s[7];
            perDateTime.start = `${YYYY}-${MM}-${DD}`;

            return perDateTime;
        },
    },
];
