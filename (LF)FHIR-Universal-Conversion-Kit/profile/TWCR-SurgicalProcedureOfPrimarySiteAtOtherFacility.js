const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-SurgicalProcedureOfPrimarySiteAtOtherFacility",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-surgical-procedure-of-primary-site-at-other-facility-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-surgical-procedure-of-primary-site-at-other-facility-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-SurgicalProcedureOfPrimarySiteAtOtherFacility"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-surgical-of-primary-site-at-other-facility-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed",
        category: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-procedure-code-codesystem",
                    code: "OtherSurgicalProcedureOfPrimarySite",
                    display: "外院原發部位手術方式",
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
        target: "Procedur.id",
        beforeConvert: (data) => {
            return `TWCR-SurgicalProcedureOfPrimarySiteAtOtherFacility-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //外院原發部位手術方式
        source: "SUGPOF",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let SUGPOFCode = JSON.parse(`
            {
                "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-other-surgical-procedure-of-primary-site-codesystem",
                      "code" : "99",
                      "display" : "不詳或不清楚"
                    }
                  ],
                  "text" : "99"
            }
            `);
            SUGPOFCode.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-other-surgical-procedure-of-primary-site-codesystem.json", data);
            SUGPOFCode.coding[0].display = displayValue;

            return SUGPOFCode;
        },
    },
    {
        //原發部位最確切的手術切除日期
        source: "DOMSUPS",
        target: "Procedure.performedDateTime",
        beforeConvert: (data) => {
            let s = String(data);
            let YYYY = s[0] + s[1] + s[2] + s[3];
            let MM = s[4] + s[5];
            let DD = s[6] + s[7];
            let perDateTime = `${YYYY}-${MM}-${DD}`;

            return perDateTime;
        },
    },
];
